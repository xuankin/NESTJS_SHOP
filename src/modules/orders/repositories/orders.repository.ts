import {Injectable} from "@nestjs/common";
import {DataSource, Repository} from "typeorm";
import {Order} from "../entities/order.entity";

@Injectable()
export class OrdersRepository extends Repository<Order> {
    constructor(private dataSource: DataSource) {
        super(Order,dataSource.createEntityManager());
    }
    async findByUserId(userId: string): Promise<Order[]> {
        return this.find({
            where: { user: { id: userId } },
            relations: ['items', 'items.order'],
            order: { createdAt: 'DESC' }
        });
    }
}