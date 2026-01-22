import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/reviews.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {Public} from "../../common/decorators/public.decorator";

@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) {}

    @Post()
    create(@CurrentUser() user: any, @Body() dto: CreateReviewDto) {
        return this.reviewsService.create(user.id, dto);
    }

    @Get('product/:productId')
    @Public()
    findByProduct(@Param('productId') productId: string) {
        return this.reviewsService.findByProduct(productId);
    }
}