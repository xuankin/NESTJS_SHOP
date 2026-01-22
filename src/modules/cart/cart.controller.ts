import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { AuthGuard } from '@nestjs/passport'; // Import Guard
import { CurrentUser } from '../../common/decorators/current-user.decorator'; // Import Decorator

@Controller('cart')
export class CartController {
    constructor(private readonly cartService: CartService) {}

    @Get()
    getCart(@CurrentUser() user: any) {
        // user.id được lấy tự động từ Token
        return this.cartService.getCart(user.id);
    }

    @Post('add')
    addToCart(@CurrentUser() user: any, @Body() dto: AddToCartDto) {
        return this.cartService.addToCart(user.id, dto);
    }

    @Patch('item/:itemId')
    updateItem(
        @CurrentUser() user: any,
        @Param('itemId') itemId: string,
        @Body() dto: UpdateCartItemDto
    ) {
        return this.cartService.updateItem(user.id, itemId, dto);
    }

    @Delete('item/:itemId')
    removeItem(@CurrentUser() user: any, @Param('itemId') itemId: string) {
        return this.cartService.removeItem(user.id, itemId);
    }

    @Delete('clear')
    clearCart(@CurrentUser() user: any) {
        return this.cartService.clearItem(user.id);
    }
}