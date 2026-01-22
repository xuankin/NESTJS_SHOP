import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Expose } from 'class-transformer';

export class CreatePaymentDto {
    @IsNotEmpty()
    @IsUUID()
    orderId: string;

    @IsNotEmpty()
    @IsString()
    paymentMethod: string;

    @IsOptional()
    amount?: number;
}
export class PaymentResponseDto {
    @Expose() id: string;
    @Expose() paymentMethod: string;
    @Expose() amount: number;
    @Expose() status: string;
    @Expose() createdAt: Date;
}