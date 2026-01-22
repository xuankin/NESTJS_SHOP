import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import {OrdersRepository} from "./repositories/orders.repository";
import {OrderItemsRepository} from "./repositories/order-items.repository";
import {CartModule} from "../cart/cart.module";
import {CouponsModule} from "../coupons/coupons.module";
import {ProductsModule} from "../products/products.module";
import {MailerModule} from "@nestjs-modules/mailer";
import {MailModule} from "../mail/mail.module";
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService,OrdersRepository,OrderItemsRepository],
  imports:[CartModule,CouponsModule,ProductsModule,MailModule,NotificationsModule],
})
export class OrdersModule {}
