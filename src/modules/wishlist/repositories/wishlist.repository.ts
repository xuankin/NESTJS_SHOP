import {DataSource, Repository} from "typeorm";
import {Wishlist} from "../entities/wishlist.entity";
import {Injectable} from "@nestjs/common";

@Injectable()
export class WishlistRepository extends Repository<Wishlist>{
    constructor(private dataSource:DataSource) {
        super(Wishlist,dataSource.createEntityManager());
    }
    async findByUserId(userId:string){
        return this.find(
            {
                where:{user:{id:userId}},
                relations:['product']
            }
        )
    }
}