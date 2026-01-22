import { Injectable } from '@nestjs/common';
import {WishlistRepository} from "./repositories/wishlist.repository";
import { plainToInstance } from 'class-transformer';
import { WishlistResponseDto } from './dto/wishlist.dto';

@Injectable()
export class WishlistService {
    constructor(private readonly wishlistRepository: WishlistRepository) {}
    private toResponseDto(data : any):any{
        return plainToInstance(WishlistResponseDto,data,{excludeExtraneousValues: true});
    }
    async toggleWishlist(userId: string, productId: string) {
        const existing = await this.wishlistRepository.findOne({
            where: { user: { id: userId }, product: { id: productId } }
        });

        if (existing) {
            await this.wishlistRepository.remove(existing);
            return { message: 'Removed from wishlist' };
        } else {
            const newItem = this.wishlistRepository.create({
                user: { id: userId },
                product: { id: productId }
            });
            await this.wishlistRepository.save(newItem);
            return { message: 'Added to wishlist', item: newItem };
        }
    }

    async getMyWishlist(userId: string) {
        const item = this.wishlistRepository.findByUserId(userId);
        return this.toResponseDto(item);
    }
}