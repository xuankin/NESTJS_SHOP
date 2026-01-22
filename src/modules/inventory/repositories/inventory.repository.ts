import {Injectable} from "@nestjs/common";
import {DataSource, Repository} from "typeorm";
import {Inventory} from "../entities/inventory.entity";

@Injectable()
export class InventoryRepository extends Repository<Inventory>{
    constructor(private dataSource : DataSource) {
        super(Inventory,dataSource.createEntityManager());
    }
    async findByProductId(productId:string){
        return this.findOne({
            where: {
                product:{
                    id:productId
                }
            }
        })
}
}