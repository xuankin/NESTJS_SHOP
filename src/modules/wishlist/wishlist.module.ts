import { Module } from '@nestjs/common';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';
import {WishlistRepository} from "./repositories/wishlist.repository";

@Module({
  controllers: [WishlistController],
  providers: [WishlistService,WishlistRepository]
})
export class WishlistModule {}
