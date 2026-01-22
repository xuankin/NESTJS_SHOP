import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from '../../users/dto/user.dto';

export class CreateReviewDto {
    @IsNotEmpty()
    @IsUUID()
    productId: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Max(5)
    rating: number;

    @IsOptional()
    @IsString()
    comment?: string;
}

export class UpdateReviewDto extends PartialType(CreateReviewDto) {}
export class ReviewResponseDto {
    @Expose() id: string;
    @Expose() rating: number;
    @Expose() comment: string;
    @Expose() isPurchased: boolean;
    @Expose() createdAt: Date;

    @Expose()
    @Type(() => UserResponseDto)
    user: UserResponseDto;
}