import { Injectable, BadRequestException } from '@nestjs/common';
import { ReviewsRepository } from "./repositories/review.repository";
import { CreateReviewDto, ReviewResponseDto } from './dto/reviews.dto';
import { DataSource } from 'typeorm';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { plainToInstance } from 'class-transformer'; // [Mới] Import Product để update rating

@Injectable()
export class ReviewsService {
    constructor(
        private readonly reviewsRepository: ReviewsRepository,
        private readonly dataSource: DataSource,
    ) {}
    private toResponseDto(data: any): any {
        return plainToInstance(ReviewResponseDto, data, { excludeExtraneousValues: true });
    }
    async create(userId: string, dto: CreateReviewDto) {

        const existingReview = await this.reviewsRepository.findOne({
            where: { user: { id: userId }, product: { id: dto.productId } }
        });
        if (existingReview) {
            throw new BadRequestException('You have already rated this product');
        }


        const hasPurchased = await this.dataSource.getRepository(Order)
            .createQueryBuilder('order')
            .innerJoin('order.items', 'item')
            .where('order.user_id = :userId', { userId })
            .andWhere('order.status = :status', { status: OrderStatus.COMPLETED })
            .andWhere("item.productVariant ->> 'id' = :productId", { productId: dto.productId })
            .getCount();

        if (hasPurchased === 0) {
            throw new BadRequestException('You must successfully purchase and receive goods to rate this product');
        }

        // 3. Tạo và lưu Review
        const review = this.reviewsRepository.create({
            user: { id: userId },
            product: { id: dto.productId },
            rating: dto.rating,
            comment: dto.comment,
            isPurchased: true,
        });
        const savedReview = await this.reviewsRepository.save(review);

        // 4. [LOGIC MỚI] Tính toán lại Rating trung bình và Update vào Product
        try {
            const { avg } = await this.reviewsRepository
                .createQueryBuilder('review')
                .select('AVG(review.rating)', 'avg')
                .where('review.product_id = :pid', { pid: dto.productId })
                .getRawOne();

            // Làm tròn 1 chữ số thập phân (VD: 4.5)
            const newRating = parseFloat(Number(avg).toFixed(1));

            await this.dataSource.getRepository(Product).update(dto.productId, {
                ratingAverage: newRating
            });
        } catch (error) {
            console.error('Error updating product rating:', error);

        }

        return this.toResponseDto(review)
    }

    async findByProduct(productId: string) {
        let reviewProduct = this.reviewsRepository.findByProductId(productId);
        if (!reviewProduct) {
            throw new BadRequestException('Product not found');
        }
        return this.toResponseDto(reviewProduct);
    }
}