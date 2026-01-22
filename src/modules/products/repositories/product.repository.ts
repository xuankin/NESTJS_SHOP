import {Injectable} from "@nestjs/common";
import {DataSource, Repository} from "typeorm";
import {Product} from "../entities/product.entity";

@Injectable()
export class ProductRepository extends Repository<Product>{
    constructor(private dataSource : DataSource) {
        super(Product,dataSource.createEntityManager());
    }
    async findAllWithPagination(page:number, limit:number,search?:string,categoryId?:string) {
        const query = this.createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .leftJoinAndSelect('product.inventory', 'inventory')
            .skip((page-1)*limit)
            .take(limit);

        if(search) {
            query.andWhere('product.name ILIKE :search', {search:`%${search}%`},);
        }
        if(categoryId) {
            query.andWhere('category.id = :categoryId', {categoryId});
        }
        query.orderBy('product.CreatedAt', 'DESC');
        const [data,total] = await query.getManyAndCount();
        return {data,total,page,limit};
    }
    async findBySlug(slug:string) {
        return this.findOne({
            where:{slug},
            relations: ['category','inventory','reviews'],
        })
    }
}