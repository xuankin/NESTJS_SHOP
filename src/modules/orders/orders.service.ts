import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { OrdersRepository } from './repositories/orders.repository';
import { CartService } from '../cart/cart.service';
import { CreateOrderDto, OrderResponseDto, UpdateOrderStatusDto } from './dto/orders.dto';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CouponRepository } from '../coupons/repositories/coupon.repository';
import { ProductRepository } from '../products/repositories/product.repository';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Product } from '../products/entities/product.entity';
import { Coupon } from '../coupons/entities/coupon.entity';
import { CouponUsage } from '../coupons/entities/coupon-usage.entity';
import { ProductsService } from '../products/products.service';
import Decimal from 'decimal.js';
import { MailService } from '../mail/mail.service'; // Custom MailService
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { plainToInstance } from 'class-transformer';

interface ItemToProcess {
    productId: string;
    quantity: number;
    productSnapshot: Product;
}

interface OrderItemPayload {
    productName: string;
    productImage: string;
    quantity: number;
    price: number;
    productVariant: any;
    originalProduct: Product;
}

@Injectable()
export class OrdersService {
    constructor(
        private readonly ordersRepository: OrdersRepository,
        private readonly cartService: CartService,
        private readonly couponsRepository: CouponRepository,
        private readonly productRepository: ProductRepository,
        private readonly productsService: ProductsService,
        private readonly dataSource: DataSource,
        private readonly mailService: MailService,
        private readonly notificationsService: NotificationsService,
    ) {}
    private toResponseDto(order: Order | Order[]): any {
        return plainToInstance(OrderResponseDto, order, { excludeExtraneousValues: true });
    }
    async createFromCart(userId: string, createOrderDto: CreateOrderDto) {
        const cart = await this.cartService.getCart(userId);
        const itemsToProcess: ItemToProcess[] = [];


        for (const item of cart.items) {
            const productEntity = await this.productRepository.findOne({
                where: { id: item.product.id },
                relations: ['inventory'] // Cần relation này để check tồn kho
            });

            if (!productEntity) {
                throw new NotFoundException(`Product ${item.product.name} no longer exists`);
            }

            itemsToProcess.push({
                productId: productEntity.id,
                quantity: item.quantity,
                productSnapshot: productEntity
            });
        }

        return this.processOrderCreation(userId, createOrderDto, itemsToProcess, true);
    }

    async create(userId: string, createOrderDto: CreateOrderDto) {
        const { items } = createOrderDto;
        if (!items || items.length === 0) {
            throw new BadRequestException('Order must have at least 1 product');
        }

        const itemsToProcess: ItemToProcess[] = [];
        for (const item of items) {
            const product = await this.productRepository.findOne({
                where: { id: item.productId },
                relations: ['inventory']
            });

            if (!product) throw new NotFoundException(`Product ID ${item.productId} does not exist`);

            itemsToProcess.push({
                productId: product.id,
                quantity: item.quantity,
                productSnapshot: product
            });
        }

        return this.processOrderCreation(userId, createOrderDto, itemsToProcess, false);
    }

    private async processOrderCreation(
        userId: string,
        dto: CreateOrderDto,
        itemsData: ItemToProcess[],
        isFromCart: boolean
    ) {
        let totalAmount = new Decimal(0);
        const orderItemsPayload: OrderItemPayload[] = [];

        for (const item of itemsData) {
            const { productSnapshot, quantity } = item;

            if (!productSnapshot.isActive) {
                throw new BadRequestException(`The product "${productSnapshot.name}" is currently discontinued`);
            }

            if (productSnapshot.inventory && productSnapshot.inventory.quantity < quantity) {
                throw new BadRequestException(`Product "${productSnapshot.name}" is not in stock (Available: ${productSnapshot.inventory.quantity})`);
            }

            const originalPrice = new Decimal(productSnapshot.price);
            const discountPercent = new Decimal(productSnapshot.discount || 0).dividedBy(100);
            const priceDecimal = originalPrice.times(new Decimal(1).minus(discountPercent));

            totalAmount = totalAmount.plus(priceDecimal.times(quantity));

            orderItemsPayload.push({
                productName: productSnapshot.name,
                productImage: productSnapshot.images?.[0] || '',
                quantity: quantity,
                price: priceDecimal.toNumber(),
                productVariant: {
                    id: productSnapshot.id,
                    name: productSnapshot.name,
                    slug: productSnapshot.slug,
                    price: productSnapshot.price,
                    description: productSnapshot.description,
                    categoryId: productSnapshot.category?.id
                },
                originalProduct: productSnapshot
            });
        }

        // 2. Xử lý Coupon
        let discountAmount = new Decimal(0);
        let couponEntity: Coupon | null = null;

        if (dto.couponCode) {
            couponEntity = await this.validateCoupon(dto.couponCode, totalAmount.toNumber(), userId);

            if (couponEntity) {
                if (couponEntity.type === 'PERCENTAGE') {
                    discountAmount = totalAmount.times(new Decimal(couponEntity.value).dividedBy(100));
                    if (couponEntity.maxDiscountAmount > 0) {
                        const maxDisc = new Decimal(couponEntity.maxDiscountAmount);
                        if (discountAmount.greaterThan(maxDisc)) {
                            discountAmount = maxDisc;
                        }
                    }
                } else {
                    discountAmount = new Decimal(couponEntity.value);
                }
            }
        }

        const shippingFee = new Decimal(30000);
        let finalAmountDecimal = totalAmount.plus(shippingFee).minus(discountAmount);
        if (finalAmountDecimal.isNegative()) {
            finalAmountDecimal = new Decimal(0);
        }

        // 3. TRANSACTION: Lưu DB
        const savedOrder = await this.dataSource.transaction(async (manager: EntityManager) => {
            const order = manager.create(Order, {
                user: { id: userId } as any,
                totalAmount: totalAmount.toNumber(),
                shippingFee: shippingFee.toNumber(),
                discountAmount: discountAmount.toNumber(),
                finalAmount: finalAmountDecimal.toNumber(),
                shippingAddress: dto.shippingAddress,
                phoneNumber: dto.phoneNumber,
                note: dto.note,
                status: OrderStatus.PENDING,
            });
            const savedOrder = await manager.save(order);

            const orderItemsEntities: OrderItem[] = [];

            for (const payload of orderItemsPayload) {
                const { originalProduct, ...itemData } = payload;

                // Trừ tồn kho (concurrency safe)
                const updateResult = await manager
                    .createQueryBuilder()
                    .update(Inventory)
                    .set({
                        quantity: () => `quantity - ${payload.quantity}`
                    })
                    .where("product_id = :productId", { productId: originalProduct.id })
                    .andWhere("quantity >= :qty", { qty: payload.quantity })
                    .execute();

                if (updateResult.affected === 0) {
                    throw new BadRequestException(`Product "${originalProduct.name}" is out of stock or insufficient quantity.`);
                }

                const orderItem = manager.create(OrderItem, {
                    ...itemData,
                    order: savedOrder
                });
                orderItemsEntities.push(orderItem);

                await manager.increment(Product, { id: originalProduct.id }, 'soldCount', payload.quantity);
            }
            await manager.save(orderItemsEntities);

            if (couponEntity) {
                const usage = manager.create(CouponUsage, {
                    coupon: couponEntity,
                    user: { id: userId },
                    order: savedOrder
                });
                await manager.save(usage);
                await manager.increment(Coupon, { id: couponEntity.id }, 'usedCount', 1);
            }

            if (isFromCart) {
                await this.cartService.clearItem(userId);
            }

            savedOrder.items = orderItemsEntities;

            const user = await manager.findOne(User, { where: { id: userId } });
            if (!user) {
                throw new NotFoundException('User not found');
            }
            savedOrder.user = user;

            return savedOrder;
        });

        // 4. GỬI MAIL
        if (savedOrder.user && savedOrder.user.email) {
            this.mailService.sendOrderConfirmation(savedOrder.user, savedOrder)
                .catch(err => console.error('Error sending confirmation email:', err));
        }

        // 5. GỬI NOTIFICATION (Socket)
        this.notificationsService.create(userId, {
            title: 'Order Placed Successfully',
            message: `Order #${savedOrder.id} has been created successfully.`,
            type: 'ORDER_CREATED',
            metadata: { orderId: savedOrder.id }
        }).catch(err => console.error('Error sending socket notification:', err));

        // 6. XÓA CACHE REDIS
        try {
            const productIds = itemsData.map(i => i.productId);
            await Promise.all(productIds.map(id => this.productsService.clearProductCache(id)));
        } catch (error) {
            console.error('Error clearing Redis cache after order placement:', error);
        }

        return  this.toResponseDto(savedOrder);
    }

    private async validateCoupon(code: string, orderValue: number, userId: string): Promise<Coupon> {
        const coupon = await this.couponsRepository.findByCode(code);
        if (!coupon) throw new NotFoundException('Coupon code does not exist');

        if (!coupon.isActive) throw new BadRequestException('Coupon is currently inactive');

        const now = new Date();
        if (now < coupon.startDate || now > coupon.endDate) {
            throw new BadRequestException('Coupon is expired or not yet valid');
        }

        if (orderValue < coupon.minOrderValue) {
            throw new BadRequestException(`Minimum order value of ${coupon.minOrderValue} is required to apply this coupon`);
        }

        const usageCount = await this.dataSource.getRepository(CouponUsage).count({
            where: {
                coupon: { id: coupon.id },
                user: { id: userId }
            }
        });

        if (usageCount > 0) {
            throw new BadRequestException('You have already used this coupon');
        }

        return coupon;
    }

    async findAll() {
        return this.ordersRepository.find({
            relations: ['user', 'items'],
            order: { createdAt: 'DESC' }
        });
    }

    async findMyOrders(userId: string) {
        const orders = await this.ordersRepository.findByUserId(userId);
        return this.toResponseDto(orders);
    }

    async findOne(id: string) {
        const order = await this.ordersRepository.findOne({
            where: { id },
            relations: ['items', 'user']
        });
        if (!order) throw new NotFoundException('Order not found');
        return this.toResponseDto(order)
    }

    async updateStatus(id: string, dto: UpdateOrderStatusDto) {
        const order = await this.findOne(id);

        if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.COMPLETED) {
            throw new BadRequestException('Cannot update an order that is already completed or cancelled');
        }

        if (dto.status === OrderStatus.CANCELLED) {
            if (order.status === OrderStatus.SHIPPING) {
                throw new BadRequestException('Order is currently being shipped and cannot be cancelled. Please contact customer support.');
            }

            await this.dataSource.transaction(async (manager) => {
                for (const item of order.items) {
                    const productId = item.productVariant?.id;
                    if (productId) {
                        await manager.increment(Inventory, { product: { id: productId } }, 'quantity', item.quantity);
                        await manager.decrement(Product, { id: productId }, 'soldCount', item.quantity);
                    }
                }
                order.status = OrderStatus.CANCELLED;
                await manager.save(order);
            });

            try {
                const productIds = order.items.map(i => i.productVariant?.id).filter(id => id);
                await Promise.all(productIds.map(id => this.productsService.clearProductCache(id)));
            } catch (e) {
                console.error('Error clearing cache when cancelling order:', e);
            }
        } else {
            order.status = dto.status;
            await this.ordersRepository.save(order);
        }

        if (order.user) {
            this.notificationsService.create(order.user.id, {
                title: 'Order Status Update',
                message: `Order #${order.id} status has been updated to: ${dto.status}`,
                type: 'ORDER_UPDATE',
                metadata: { orderId: order.id, status: dto.status }
            }).catch(err => console.error('Error sending status notification:', err));
        }

        return this.toResponseDto(order);
    }
}