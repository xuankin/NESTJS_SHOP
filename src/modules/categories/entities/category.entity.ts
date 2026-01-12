import {Column, Entity, JoinColumn, ManyToOne, OneToMany} from "typeorm";
import {AbstractEntity} from "../../../common/entities/abstract.entity";
import {Product} from "../../products/entities/product.entity";

@Entity('categories')
export class Category extends AbstractEntity {
    @Column()
    name: string;
    @Column({type:'text',nullable :true})
    description: string;
    @Column({nullable:true})
    image: string;
    @Column({unique:true})
    slug: string;
    @ManyToOne(() => Category, (category)=>category.children, {nullable:true})
    @JoinColumn({name:'parent_id'})
    parent: Category;
    @OneToMany(() => Category, (category)=>category.parent)
    children: Category[];
    @OneToMany(()=>Product, (product)=>product.category)
    products: Product[]
}