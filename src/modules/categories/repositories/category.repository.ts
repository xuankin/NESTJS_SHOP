import {Injectable} from "@nestjs/common";
import {DataSource, IsNull, Repository} from "typeorm";
import {Category} from "../entities/category.entity";

@Injectable()
export class CategoriesRepository  extends Repository<Category> {
    constructor(private datasource: DataSource) {
        super(Category, datasource.createEntityManager());
    }

    async findRoots(): Promise<Category[]> {
        return this.find({
            where: {
                parent: IsNull(),
            },
            relations: ['children'],

        });
    }
    async findBySlug(slug: string): Promise<Category[]> {
        return this.find({
            where: {slug},
            relations: ['parent','children'],
        })
    }
}