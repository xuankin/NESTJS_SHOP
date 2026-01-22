import { Column, Entity, OneToMany } from "typeorm";
import { AbstractEntity } from "../../../common/entities/abstract.entity";
import { CouponUsage } from "./coupon-usage.entity";

export enum CouponType {
    PERCENTAGE = 'PERCENTAGE',
    FIXED_AMOUNT = 'FIXED_AMOUNT',
}

@Entity('coupons')
export class Coupon extends AbstractEntity {
    @Column({ unique: true })
    code: string;

    @Column({ type: 'enum', enum: CouponType })
    type: CouponType;


    @Column({ type: 'decimal', precision: 12, scale: 2 })
    value: number;


    @Column('decimal', { precision: 12, scale: 2, default: 0 })
    minOrderValue: number;


    @Column('decimal', { precision: 12, scale: 2, default: 0 })
    maxDiscountAmount: number;

    @Column()
    startDate: Date;

    @Column()
    endDate: Date;

    @Column('int', { default: 0 })
    usedCount: number;

    @Column({ default: true })
    isActive: boolean;

    @OneToMany(type => CouponUsage, (usage) => usage.coupon)
    usages: CouponUsage[];
}