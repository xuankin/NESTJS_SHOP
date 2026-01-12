import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { AbstractEntity } from "../../../common/entities/abstract.entity";
import { Order } from "./order.entity";

@Entity('order_items')
export class OrderItem extends AbstractEntity {
    @Column()
    productName: string;

    @Column({ nullable: true })
    productImage: string;

    @Column({ type: 'int' })
    quantity: number;

    @Column('decimal', { precision: 12, scale: 2 })
    price: number;

    @Column({ type: 'jsonb', nullable: true })
    productVariant: any;

    @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'order_id' })
    order: Order;
}