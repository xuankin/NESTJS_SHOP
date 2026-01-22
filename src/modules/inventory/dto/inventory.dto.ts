import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Expose } from 'class-transformer';


export class UpdateInventoryDto {
    @IsOptional()
    @IsNumber()
    @Min(0)
    quantity?: number;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    lowStockThreshold?: number;
}
export class InventoryResponseDto {
    @Expose() quantity: number;
    @Expose() location: string;
    @Expose() lowStockThreshold: number;
    @Expose() updatedAt: Date;
}