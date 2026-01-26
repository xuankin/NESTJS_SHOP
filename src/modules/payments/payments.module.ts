import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import {PaymentsRepository} from "./repositories/payments.repository";
import { OrdersModule } from '../orders/orders.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports:[ConfigModule,OrdersModule],
  controllers: [PaymentsController],
  providers: [PaymentsService,PaymentsRepository]
})
export class PaymentsModule {}
