import { PartialType } from '@nestjs/mapped-types';
import { Expose, Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { CouponType } from '../entities/coupon.entity';

export class CreateCouponDto {
    @IsNotEmpty()
    @IsString()
    code: string;

    @IsNotEmpty()
    @IsEnum(CouponType)
    type: CouponType;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    value: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    minOrderValue?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    maxDiscountAmount?: number;

    @IsNotEmpty()
    @Type(() => Date)
    @IsDate()
    startDate: Date;

    @IsNotEmpty()
    @Type(() => Date)
    @IsDate()
    endDate: Date;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateCouponDto extends PartialType(CreateCouponDto) {}
export class CouponResponseDto {
    @Expose() id: string;
    @Expose() code: string;
    @Expose() type: string;
    @Expose() value: number;
    @Expose() minOrderValue: number;
    @Expose() maxDiscountAmount: number;
    @Expose() startDate: Date;
    @Expose() endDate: Date;
    @Expose() isActive: boolean;
    @Expose() usedCount: number;
}