import {Injectable} from "@nestjs/common";
import {DataSource, Repository} from "typeorm";
import {Cart} from "../entities/cart.entity";
import {CartItem} from "../entities/cart-item.entity";

@Injectable()
export class CartRepository extends Repository<Cart>{
    constructor(private dataSource: DataSource) {
        super(Cart,dataSource.createEntityManager());
    }
    async findByUserId(userId:string):Promise<any>{
        return this.findOne({
            where : {user :{id:userId}},
            relations: ['items','items.product', 'items.product.inventory'],
    });
    }
}
@Injectable()
export class CartItemRepository extends Repository<CartItem>{
    constructor(private dataSource: DataSource) {
        super(CartItem,dataSource.createEntityManager());
    }
}