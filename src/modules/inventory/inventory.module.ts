import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import {InventoryRepository} from "./repositories/inventory.repository";
import {ProductsService} from "../products/products.service";
import {ProductRepository} from "../products/repositories/product.repository";

@Module({
  controllers: [InventoryController],
  providers: [InventoryService,InventoryRepository],
  exports: [InventoryService, InventoryRepository]
})
export class InventoryModule {}
