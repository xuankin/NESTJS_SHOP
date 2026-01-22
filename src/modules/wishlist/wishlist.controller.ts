import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { AddToWishlistDto } from './dto/wishlist.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('wishlist')
export class WishlistController {
    constructor(private readonly wishlistService: WishlistService) {}

    @Post('toggle')
    toggle(@CurrentUser() user: any, @Body() dto: AddToWishlistDto) {
        return this.wishlistService.toggleWishlist(user.id, dto.productId);
    }

    @Get()
    getMyWishlist(@CurrentUser() user: any) {
        return this.wishlistService.getMyWishlist(user.id);
    }
}