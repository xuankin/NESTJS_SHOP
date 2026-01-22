import { PartialType } from '@nestjs/mapped-types';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';
import { UserResponseDto } from '../../users/dto/user.dto';

export class OrderItemDto {
    @IsNotEmpty()
    @IsUUID()
    productId: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    quantity: number;
}

export class CreateOrderDto {
    @IsNotEmpty()
    @IsString()
    shippingAddress: string;

    @IsNotEmpty()
    @IsPhoneNumber('VN')
    phoneNumber: string;

    @IsOptional()
    @IsString()
    note?: string;

    @IsOptional()
    @IsString()
    couponCode?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}

export class UpdateOrderStatusDto {
    @IsNotEmpty()
    @IsEnum(OrderStatus)
    status: OrderStatus;
}
export class OrderItemResponseDto {
    @Expose() productName: string;
    @Expose() quantity: number;
    @Expose() price: number;
    @Expose() productImage: string;
}

export class OrderResponseDto {
    @Expose() id: string;
    @Expose() totalAmount: number;
    @Expose() shippingFee: number;
    @Expose() discountAmount: number;
    @Expose() finalAmount: number;
    @Expose() status: string;
    @Expose() shippingAddress: string;
    @Expose() phoneNumber: string;
    @Expose() note: string;
    @Expose() createdAt: Date;

    @Expose()
    @Type(() => OrderItemResponseDto)
    items: OrderItemResponseDto[];


    @Expose()
    @Type(() => UserResponseDto)
    user: any;
}