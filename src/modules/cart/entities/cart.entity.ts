import {Entity, JoinColumn, OneToMany, OneToOne} from "typeorm";
import {AbstractEntity} from "../../../common/entities/abstract.entity";
import {User} from "../../users/entities/user.entity";
import {CartItem} from "./cart-item.entity";

@Entity('carts')
export class Cart extends AbstractEntity{
    @OneToOne(()=>User, (user)=>user.cart ,{cascade:true})
    @JoinColumn({name:'user_id'})
    user:User;
    @OneToMany(()=>CartItem,(item)=>item.cart,{cascade:true})
    items:CartItem[];
}