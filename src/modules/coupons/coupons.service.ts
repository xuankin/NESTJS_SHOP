import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import {CouponRepository} from "./repositories/coupon.repository";
import { CouponResponseDto, CreateCouponDto, UpdateCouponDto } from './dto/coupon.dto';
import {NotificationsService} from "../notifications/notifications.service";
import { plainToInstance } from 'class-transformer';
import { NotificationResponseDto } from '../notifications/dto/notifications.dto';
@Injectable()
export class CouponsService {
    constructor(private readonly couponsRepository: CouponRepository,
                private readonly notificationsService: NotificationsService) {}

    private toResponseDto(data: any): any {
        return plainToInstance(CouponResponseDto, data, { excludeExtraneousValues: true });
    }

    async create(dto: CreateCouponDto) {
        const exist = await this.couponsRepository.findByCode(dto.code);
        if (exist) throw new BadRequestException('Coupon code already exists');


        const coupon = this.couponsRepository.create(dto);
        const savedCoupon = await this.couponsRepository.save(coupon);


        if (savedCoupon.isActive) {

            const valueText = savedCoupon.type === 'PERCENTAGE'
                ? `${savedCoupon.value}%`
                : `${savedCoupon.value.toLocaleString()}đ`;

            this.notificationsService.createBroadcast({
                title: '🎁 Mã giảm giá mới!',
                message: `Nhập mã ${savedCoupon.code} để được giảm ${valueText} cho đơn hàng của bạn. Hạn dùng đến ${savedCoupon.endDate.toLocaleDateString()}.`,
                type: 'COUPON_NEW',
                metadata: {
                    couponCode: savedCoupon.code,
                    couponId: savedCoupon.id
                }
            }).catch(err => console.error('Error sending coupon notification:', err));
        }

        return this.toResponseDto(savedCoupon);
    }

    async findAll() {
        let coupon = this.couponsRepository.find();
        if (!coupon) {
            throw new NotFoundException('Coupon not found');
        }
        return this.toResponseDto(coupon);
    }

    async update(id: string, dto: UpdateCouponDto) {
        await this.couponsRepository.update(id, dto);
        const updateCoupon = this.couponsRepository.findOne({ where: { id } });
        return this.toResponseDto(updateCoupon);
    }

    async validate(code: string, orderValue: number) {
        const coupon = await this.couponsRepository.findByCode(code);
        if (!coupon || !coupon.isActive) throw new NotFoundException('Invalid coupon');

        const now = new Date();
        if (now < coupon.startDate || now > coupon.endDate) throw new BadRequestException('Coupon expired');

        if (coupon.minOrderValue && orderValue < coupon.minOrderValue) {
            throw new BadRequestException(`Order value must be at least ${coupon.minOrderValue}`);
        }

        return this.toResponseDto(coupon);
    }
}