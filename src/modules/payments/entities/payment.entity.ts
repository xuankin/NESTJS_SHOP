import {Column, Entity, JoinColumn, ManyToOne, OneToOne} from "typeorm";
import { AbstractEntity } from "../../../common/entities/abstract.entity";
import {Order} from "../../orders/entities/order.entity";


@Entity('order_items')
export class Payment extends AbstractEntity {
    @Column()
    productName: string;

    @Column({ nullable: true })
    productImage: string;

    @Column({ type: 'int' })
    quantity: number;

    @Column('decimal', { precision: 12, scale: 2 })
    price: number;

    // QUAN TRỌNG: Lưu JSONB snapshot của product thay vì Relation FK
    @Column({ type: 'jsonb', nullable: true })
    productVariant: any;

    @OneToOne(() => Order, (order) => order.payment)
    @JoinColumn({ name: 'order_id' })
    order: Order;
}