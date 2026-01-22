import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { UpdateInventoryDto } from './dto/inventory.dto';
import {UserRole} from "../users/entities/user.entity";
import {Roles} from "../auth/decorators/role.decorator";

@Controller('inventory')
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) {}

    @Get('product/:productId')
    getByProduct(@Param('productId') productId: string) {
        return this.inventoryService.getByProduct(productId);
    }

    @Patch('product/:productId')
    @Roles(UserRole.ADMIN, UserRole.SELLER)
    updateStock(@Param('productId') productId: string, @Body() dto: UpdateInventoryDto) {
        return this.inventoryService.updateStock(productId, dto);
    }
}