import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';
import { ProductResponseDto } from '../../products/dto/products.dto';
import { Expose, Type } from 'class-transformer';

export class AddToCartDto {
    @IsNotEmpty()
    @IsUUID()
    productId: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    quantity: number;
}

export class UpdateCartItemDto {
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    quantity: number;
}
export class CartItemResponseDto {
    @Expose() id: string;
    @Expose() quantity: number;

    @Expose()
    @Type(() => ProductResponseDto)
    product: ProductResponseDto;
}

export class CartResponseDto {
    @Expose() id: string;

    @Expose()
    @Type(() => CartItemResponseDto)
    items: CartItemResponseDto[];

    @Expose() createdAt: Date;
    @Expose() updatedAt: Date;
}