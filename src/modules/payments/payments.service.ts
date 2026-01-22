import { Injectable } from '@nestjs/common';
import { PaymentsRepository } from './repositories/payments.repository';
import { CreatePaymentDto } from './dto/payments.dto';
import { Order } from '../orders/entities/order.entity';

@Injectable()
export class PaymentsService {
    constructor(private readonly paymentsRepository: PaymentsRepository) {}

    async createPayment(dto: CreatePaymentDto) {
        const payment = this.paymentsRepository.create({
            order: { id: dto.orderId } as Order,
            amount: dto.amount || 0,
            paymentMethod: dto.paymentMethod,
            status: 'PENDING'
        });

        // Lưu vào DB
        await this.paymentsRepository.save(payment);

        return {
            message: 'Payment created successfully',
            paymentId: payment.id,
            method: dto.paymentMethod
        };
    }
}