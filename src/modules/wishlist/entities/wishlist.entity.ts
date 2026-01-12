import { Entity, JoinColumn, ManyToOne } from "typeorm";
import { AbstractEntity } from "../../../common/entities/abstract.entity";
import { User } from "../../users/entities/user.entity";
import { Product } from "../../products/entities/product.entity";

@Entity('wishlists')
export class Wishlist extends AbstractEntity {
    @ManyToOne(() => User, (user) => user.wishlist)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Product, (product) => product.wishlists)
    @JoinColumn({ name: 'product_id' })
    product: Product;
}