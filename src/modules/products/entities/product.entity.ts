import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { AbstractEntity } from "../../../common/entities/abstract.entity";
import { Category } from "../../categories/entities/category.entity";
import { User } from "../../users/entities/user.entity";
import { Inventory } from "../../inventory/entities/inventory.entity";
import { Review } from "../../reviews/entities/review.entity";
import { Wishlist } from "../../wishlist/entities/wishlist.entity";
import { CartItem } from "../../cart/entities/cart-item.entity";

@Entity('products')
export class Product extends AbstractEntity {
    @Column()
    name: string;

    @Column({ unique: true })
    slug: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column('decimal', { precision: 12, scale: 2 })
    price: number;

    @Column('float', { default: 0 })
    discount: number;

    @Column('text', { array: true, default: [] })
    images: string[];

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'int', default: 0 })
    soldCount: number;

    @Column('float', { default: 0 })
    ratingAverage: number;

    // Relations
    @ManyToOne(() => Category, (category) => category.products)
    @JoinColumn({ name: 'category_id' })
    category: Category;

    @ManyToOne(() => User, (user) => user.products)
    @JoinColumn({ name: 'seller_id' })
    seller: User;

    @OneToOne(() => Inventory, (inv) => inv.product, { cascade: true })
    inventory: Inventory;

    @OneToMany(() => Review, (review) => review.product)
    reviews: Review[];

    @OneToMany(() => Wishlist, (wishlist) => wishlist.product)
    wishlists: Wishlist[]; // Đã khớp với entity Wishlist

    @OneToMany(() => CartItem, (cartItem) => cartItem.product)
    cartItems: CartItem[];
}