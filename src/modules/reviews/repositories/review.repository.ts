import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import {Review} from "../entities/review.entity";


@Injectable()
export class ReviewsRepository extends Repository<Review> {
    constructor(private dataSource: DataSource) {
        super(Review, dataSource.createEntityManager());
    }

    async findByProductId(productId: string): Promise<Review[]> {
        return this.find({
            where: { product: { id: productId } },
            relations: ['user'],
            order: { CreatedAt: 'DESC' }
        });
    }
}