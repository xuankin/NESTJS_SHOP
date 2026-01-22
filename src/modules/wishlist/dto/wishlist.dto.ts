import { IsNotEmpty, IsUUID } from 'class-validator';
import { ProductResponseDto } from '../../products/dto/products.dto';
import { Expose, Type } from 'class-transformer';

export class AddToWishlistDto {
    @IsNotEmpty()
    @IsUUID()
    productId: string;
}
export class WishlistResponseDto {
    @Expose() id: string;
    @Expose() createdAt: Date;

    @Expose()
    @Type(() => ProductResponseDto)
    product: ProductResponseDto;
}