import { Module } from '@nestjs/common';
import { CouponsController } from './coupons.controller';
import { CouponsService } from './coupons.service';
import {CategoriesModule} from "../categories/categories.module";
import {CouponRepository} from "./repositories/coupon.repository";
import {NotificationsModule} from "../notifications/notifications.module";

@Module({
  imports: [CategoriesModule,NotificationsModule],
  controllers: [CouponsController],
  providers: [CouponsService,CouponRepository],
  exports: [CouponsService, CouponRepository]
})
export class CouponsModule {}
