import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/orders.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {UserRole} from "../users/entities/user.entity";
import {Roles} from "../auth/decorators/role.decorator";

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Post('create-from-cart')
    createFromCart(@CurrentUser() user: any, @Body() dto: CreateOrderDto) {
        return this.ordersService.createFromCart(user.id, dto);
    }

    @Post('create-direct')
    createDirect(@CurrentUser() user: any, @Body() dto: CreateOrderDto) {
        return this.ordersService.create(user.id, dto);
    }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.SELLER)
    findAll() {
        return this.ordersService.findAll();
    }

    @Get('my-orders')
    findMyOrders(@CurrentUser() user: any) {
        return this.ordersService.findMyOrders(user.id);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.ordersService.findOne(id);
    }

    @Patch(':id/status')
    @Roles(UserRole.ADMIN, UserRole.SELLER)
    updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
        return this.ordersService.updateStatus(id, dto);
    }
}