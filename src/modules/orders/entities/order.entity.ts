import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { AbstractEntity } from "../../../common/entities/abstract.entity";
import { User } from "../../users/entities/user.entity";
import { OrderItem } from "./order-item.entity";
import { CouponUsage } from "../../coupons/entities/coupon-usage.entity";
import {Payment} from "../../payments/entities/payment.entity";

export enum OrderStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    SHIPPING = 'shipping',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order extends AbstractEntity {
    @Column('decimal', { precision: 12, scale: 2 })
    totalAmount: number;

    @Column('decimal', { precision: 12, scale: 2, default: 0 })
    shippingFee: number;

    @Column('decimal', { precision: 12, scale: 2, default: 0 })
    discountAmount: number;

    @Column('decimal', { precision: 12, scale: 2 })
    finalAmount: number;

    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
    status: OrderStatus;

    @Column()
    shippingAddress: string;

    @Column()
    phoneNumber: string;

    @Column({ nullable: true })
    note: string;

    @ManyToOne(() => User, (user) => user.order)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
    items: OrderItem[];

    @OneToOne(() => Payment, (payment) => payment.order, { cascade: true })
    payment: Payment;

    @OneToOne(() => CouponUsage, (usage) => usage.order)
    couponUsage: CouponUsage;
}