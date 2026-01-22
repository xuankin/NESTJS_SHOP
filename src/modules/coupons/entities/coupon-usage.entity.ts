import { Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { AbstractEntity } from "../../../common/entities/abstract.entity";
import { Coupon } from "./coupon.entity";
import { User } from "../../users/entities/user.entity";
import { Order } from "../../orders/entities/order.entity";

@Entity('coupon_usage')
export class CouponUsage extends AbstractEntity {
    @ManyToOne(() => Coupon, coupon => coupon.usages)
    coupon: Coupon;

    @ManyToOne(() => User, (user) => user.couponUsages)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToOne(() => Order, (order) => order.couponUsage)
    @JoinColumn({ name: 'order_id' })
    order: Order;
}