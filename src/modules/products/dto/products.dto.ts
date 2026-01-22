import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Expose, Transform, Type } from 'class-transformer'; // Import thêm Type và Transform

export class CreateProductDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    price: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    discount?: number;

    // Field này sẽ được Controller tự điền sau khi upload xong,
    // Client không cần gửi field này trong body text
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    isActive?: boolean;

    @IsNotEmpty()
    @IsUUID()
    categoryId: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    initialStock?: number;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
export class ProductResponseDto {
    @Expose()
    id: string;

    @Expose()
    name: string;

    @Expose()
    slug: string;

    @Expose()
    description: string;

    @Expose()
    price: number;

    @Expose()
    discount: number;

    @Expose()
    images: string[];

    @Expose()
    soldCount: number;

    @Expose()
    ratingAverage: number;

    @Expose()
    @Type(() => CategoryResponseDto) // Bạn cần tạo CategoryResponseDto tương tự
    category: any;

    @Expose()
    isActive: boolean;

    @Expose()
    createdAt: Date;
}


export class CategoryResponseDto {
    @Expose() id: string;
    @Expose() name: string;
    @Expose() slug: string;
}