import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { AbstractEntity } from "../../../common/entities/abstract.entity";
import { Cart } from "./cart.entity";
import { Product } from "../../products/entities/product.entity";

@Entity('cart_items')
export class CartItem extends AbstractEntity {
    @Column({ type: 'int', default: 1 })
    quantity: number;

    @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'cart_id' })
    cart: Cart;

    @ManyToOne(() => Product, (product) => product.cartItems)
    @JoinColumn({ name: 'product_id' })
    product: Product;
}