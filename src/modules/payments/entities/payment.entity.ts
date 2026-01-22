import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { AbstractEntity } from "../../../common/entities/abstract.entity";
import { Order } from "../../orders/entities/order.entity";

@Entity('payments') // Tên bảng
export class Payment extends AbstractEntity {
    @Column()
    paymentMethod: string; // COD, PAYPAL...

    @Column('decimal', { precision: 12, scale: 2, default: 0 })
    amount: number;

    @Column({ default: 'PENDING' })
    status: string; // PENDING, COMPLETED, FAILED

    @OneToOne(() => Order, (order) => order.payment)
    @JoinColumn({ name: 'order_id' })
    order: Order;
}