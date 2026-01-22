import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import {CartItemRepository, CartRepository} from "./repositories/cart.repository";
import {ProductRepository} from "../products/repositories/product.repository";

@Module({
  controllers: [CartController],
  providers: [CartService,CartRepository,CartItemRepository,ProductRepository],
  exports: [CartService, CartRepository, CartItemRepository]
})
export class CartModule {}
