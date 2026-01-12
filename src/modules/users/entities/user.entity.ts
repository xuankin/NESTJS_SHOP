import { Column, Entity, OneToMany, OneToOne } from "typeorm";
import { AbstractEntity } from "../../../common/entities/abstract.entity";
import { Order } from "../../orders/entities/order.entity";
import { Product } from "../../products/entities/product.entity";
import { Cart } from "../../cart/entities/cart.entity"; // Đảm bảo import Cart
import { Review } from "../../reviews/entities/review.entity";
import { CouponUsage } from "../../coupons/entities/coupon-usage.entity";
import { Notification } from "../../notifications/entities/notification.entity"; // Đã thêm
import { Wishlist } from "../../wishlist/entities/wishlist.entity"; // Đã thêm

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
    SELLER = 'seller',
}

@Entity('users') // Đặt tên bảng rõ ràng
export class User extends AbstractEntity {
    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @Column({ select: false })
    password: string;

    @Column({ default: '' })
    fullName: string;

    @Column({ nullable: true })
    phoneNumber: string;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    avatar: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
    role: UserRole;

    @Column({ default: true })
    isActive: boolean;

    // === RELATIONSHIPS ===

    @OneToMany(() => Order, (order) => order.user)
    orders: Order[]; // Đổi tên thành số nhiều

    // Sửa thành OneToOne theo ERD (User sở hữu 1 Cart)
    @OneToOne(() => Cart, (cart) => cart.user)
    cart: Cart;

    @OneToMany(() => Review, (review) => review.user)
    reviews: Review[]; // Đổi tên thành số nhiều

    @OneToMany(() => Product, (product) => product.seller)
    products: Product[];

    @OneToMany(() => Notification, (notification) => notification.user)
    notifications: Notification[];

    @OneToMany(() => CouponUsage, (usage) => usage.user)
    couponUsages: CouponUsage[];

    @OneToMany(() => Wishlist, (wishlist) => wishlist.user)
    wishlist: Wishlist[];
}