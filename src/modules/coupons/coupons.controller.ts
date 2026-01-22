import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CreateCouponDto, UpdateCouponDto } from './dto/coupon.dto';
import {UserRole} from "../users/entities/user.entity";
import {Roles} from "../auth/decorators/role.decorator";

@Controller('coupons')
export class CouponsController {
    constructor(private readonly couponsService: CouponsService) {}

    @Post()
    @Roles(UserRole.ADMIN, UserRole.SELLER)
    create(@Body() dto: CreateCouponDto) {
        return this.couponsService.create(dto);
    }

    @Get()
    findAll() {
        return this.couponsService.findAll();
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.SELLER)
    update(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
        return this.couponsService.update(id, dto);
    }
}