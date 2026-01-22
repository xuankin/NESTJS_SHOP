import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Expose, Type } from 'class-transformer';

export class CreateCategoryDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    image?: string;

    @IsOptional()
    @IsUUID()
    parentId?: string;
}
export class CategoryResponseDto {
    @Expose() id: string;
    @Expose() name: string;
    @Expose() description: string;
    @Expose() image: string;
    @Expose() slug: string;

    @Expose()
    @Type(() => CategoryResponseDto) // Đệ quy cho danh mục con
    children: CategoryResponseDto[];
}
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}