import {Entity, ManyToOne, OneToOne} from "typeorm";
import {Coupon} from "./coupon.entity";
import {User} from "../../users/entities/user.entity";
import {Order} from "../../orders/entities/order.entity";

@Entity('coupon_usage')
export class CouponUsage {
    @ManyToOne(()=>Coupon , coupon => coupon.usages)
    coupon:Coupon[];
    @ManyToOne(()=>User,(user) => user.couponUsages)
    user:User;
    @OneToOne(()=>Order,(order)=>order.couponUsage)
    order:Order;
}
