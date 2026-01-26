import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentsRepository } from './repositories/payments.repository';
import { OrdersService } from '../orders/orders.service';
import { OrderStatus } from '../orders/entities/order.entity';
import * as crypto from 'crypto';
import * as qs from 'qs';
import moment from 'moment';

@Injectable()
export class PaymentsService {
    constructor(
      private readonly paymentsRepository: PaymentsRepository,
      private readonly configService: ConfigService,
      private readonly ordersService: OrdersService,
    ) {}

    createVnPayUrl(amount: number, orderId: string, ipAddr: string, language = 'vn') {
        const tmnCode = this.configService.get<string>('VNP_TMN_CODE');
        const secretKey = this.configService.get<string>('VNP_HASH_SECRET') ?? '';
        let vnpUrl = this.configService.get<string>('VNP_URL');
        const returnUrl = this.configService.get<string>('VNP_RETURN_URL');

        const createDate = moment().format('YYYYMMDDHHmmss');

        // Sử dụng Record<string, any> để tránh lỗi TS2345
        let vnp_Params: Record<string, any> = {};

        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = language;
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = `Thanh toan don hang ${orderId}`;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = amount * 100;
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;


        vnp_Params = this.sortObject(vnp_Params);


        const signData = qs.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac('sha512', secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        vnp_Params['vnp_SecureHash'] = signed;
        vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

        return { url: vnpUrl };
    }

    async handleVnPayIpn(query: any) {
        const secureHash = query['vnp_SecureHash'];

        // Clone query để không làm ảnh hưởng đến object gốc
        const data = { ...query };
        delete data['vnp_SecureHash'];
        delete data['vnp_SecureHashType'];

        const sortedParams = this.sortObject(data);
        const secretKey = this.configService.get<string>('VNP_HASH_SECRET') ?? '';

        const signData = qs.stringify(sortedParams, { encode: false });
        const hmac = crypto.createHmac('sha512', secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        if (secureHash === signed) {
            const orderId = query['vnp_TxnRef'];
            const rspCode = query['vnp_ResponseCode'];

            const order = await this.ordersService.findOne(orderId);
            if (!order) return { RspCode: '01', Message: 'Order not found' };


            if (order.status === OrderStatus.CONFIRMED || order.status === OrderStatus.COMPLETED) {
                return { RspCode: '02', Message: 'Order already confirmed' };
            }

            if (rspCode === '00') {
                await this.ordersService.updateStatus(orderId, { status: OrderStatus.CONFIRMED });

                await this.paymentsRepository.save(this.paymentsRepository.create({
                    order: { id: orderId } as any,
                    paymentMethod: 'VNPAY',
                    amount: Number(query['vnp_Amount']) / 100,
                    status: 'COMPLETED'
                }));

                return { RspCode: '00', Message: 'Success' };
            } else {
                return { RspCode: '00', Message: 'Payment failed' };
            }
        } else {
            return { RspCode: '97', Message: 'Checksum failed' };
        }
    }

    private sortObject(obj: Record<string, any>): Record<string, any> {
        const sorted: Record<string, any> = {};
        const keys = Object.keys(obj).sort();

        for (const key of keys) {
            if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
                sorted[encodeURIComponent(key)] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
            }
        }
        return sorted;
    }
}