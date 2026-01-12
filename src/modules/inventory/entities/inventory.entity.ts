import {Column, Entity, JoinColumn, OneToOne} from "typeorm";
import {AbstractEntity} from "../../../common/entities/abstract.entity";
import {Product} from "../../products/entities/product.entity";

@Entity('inventories')
export class Inventory extends AbstractEntity{
    @OneToOne(()=>Product, (product)=>product.inventory)
    @JoinColumn({name:'product_id'})
    product: Product;
    @Column('int',{default:0})
    quantity: number;
    @Column({default:'Main WareHouse'})
    location:string
    @Column('int',{default:10})
    lowStockThreshold: number;
}