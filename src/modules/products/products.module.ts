import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import {ProductRepository} from "./repositories/product.repository";
import {InventoryModule} from "../inventory/inventory.module";
import {CategoriesModule} from "../categories/categories.module";

@Module({
  imports: [CategoriesModule,InventoryModule],
  controllers: [ProductsController],
  providers: [ProductsService,ProductRepository],
  exports: [ProductsService, ProductRepository]
})
export class ProductsModule {}
