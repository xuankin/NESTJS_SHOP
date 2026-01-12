import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CartModule } from './modules/cart/cart.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { UploadsModule } from './modules/uploads/uploads.module';

@Module({
  imports: [UsersModule, AuthModule, ProductsModule, OrdersModule, CategoriesModule, CartModule, ReviewsModule, CouponsModule, InventoryModule, WishlistModule, NotificationsModule, PaymentsModule, UploadsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
