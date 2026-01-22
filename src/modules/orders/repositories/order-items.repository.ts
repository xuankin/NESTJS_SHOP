import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { OrderItem } from '../entities/order-item.entity';

@Injectable()
export class OrderItemsRepository extends Repository<OrderItem> {
    constructor(private dataSource: DataSource) {
        super(OrderItem, dataSource.createEntityManager());
    }
    async findByOrderAndProduct(orderId: string, productId: string): Promise<OrderItem | null> {
        return this.findOne({
            where: {
                order: { id: orderId },

            }
        });
    }
    async deleteByOrderId(orderId: string): Promise<void> {
        await this.delete({ order: { id: orderId } });
    }
}