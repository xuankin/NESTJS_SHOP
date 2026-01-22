import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InventoryRepository } from "./repositories/inventory.repository";
import { InventoryResponseDto, UpdateInventoryDto } from './dto/inventory.dto';
import Redis from 'ioredis';
import { CartResponseDto } from '../cart/dto/cart.dto';
import { plainToInstance } from 'class-transformer'; //

@Injectable()
export class InventoryService {
    constructor(
        private readonly inventoryRepository: InventoryRepository,
        @Inject('REDIS_CLIENT') private readonly redis: Redis // ✅ Inject Redis Client
    ) {}
    private toResponseDto(cart: any): InventoryResponseDto {
        return plainToInstance(InventoryResponseDto, cart, { excludeExtraneousValues: true });
    }
    async getByProduct(productId: string) {
        const inventory = await this.inventoryRepository.findByProductId(productId);
        if (!inventory) throw new NotFoundException('Inventory info not found');
        return inventory;
    }

    async updateStock(productId: string, dto: UpdateInventoryDto) {
        let inventory = await this.inventoryRepository.findByProductId(productId);


        if (!inventory) {
            inventory = this.inventoryRepository.create({ product: { id: productId } });
        }


        if (dto.quantity !== undefined) inventory.quantity = dto.quantity;
        if (dto.location) inventory.location = dto.location;
        if (dto.lowStockThreshold) inventory.lowStockThreshold = dto.lowStockThreshold;

        const savedInventory = await this.inventoryRepository.save(inventory);


        try {
            // 1. Xóa cache chi tiết sản phẩm (để khách xem detail thấy số lượng mới)
            await this.redis.del(`product:id:${productId}`);


            const keys = await this.redis.keys('products:list:*');
            if (keys.length > 0) {
                await this.redis.del(keys);
            }
        } catch (error) {
            console.error('Error deleting Redis cache when updating the repository:', error);

        }

        return this.toResponseDto(savedInventory);
    }

    async checkStockAvailability(productId: string, quantity: number): Promise<boolean> {
        const inventory = await this.inventoryRepository.findByProductId(productId);
        return inventory ? inventory.quantity >= quantity : false;
    }
}