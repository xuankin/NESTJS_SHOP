// src/seed.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './modules/users/entities/user.entity';
import { Category } from './modules/categories/entities/category.entity';
import { Product } from './modules/products/entities/product.entity';
import { Inventory } from './modules/inventory/entities/inventory.entity';
import { Coupon, CouponType } from './modules/coupons/entities/coupon.entity';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);
    const manager = dataSource.manager;

    console.log('🌱 Bắt đầu tạo dữ liệu mẫu...');

    // 1. Xóa dữ liệu cũ (theo thứ tự quan hệ khóa ngoại)
    // Lưu ý: Cẩn thận khi chạy trên production!
    await manager.query('TRUNCATE TABLE "order_items", "orders", "cart_items", "carts", "reviews", "inventories", "products", "categories", "users", "coupons" CASCADE');

    // 2. Tạo Users
    const password = await bcrypt.hash('123456', 10);

    const admin = manager.create(User, {
        username: 'admin', email: 'admin@gmail.com', password, fullName: 'Admin System', role: UserRole.ADMIN,
    });

    const seller = manager.create(User, {
        username: 'seller', email: 'seller@gmail.com', password, fullName: 'Apple Store VN', role: UserRole.SELLER,
    });

    const buyer = manager.create(User, {
        username: 'buyer', email: 'buyer@gmail.com', password, fullName: 'Nguyen Van Mua', role: UserRole.USER, address: 'Ho Chi Minh City', phoneNumber: '0909123456'
    });

    await manager.save([admin, seller, buyer]);
    console.log('✅ Đã tạo Users: admin, seller, buyer (Pass: 123456)');

    // 3. Tạo Categories
    const catElec = manager.create(Category, { name: 'Điện tử', slug: 'dien-tu', description: 'Laptop, Mobile...' });
    const catFashion = manager.create(Category, { name: 'Thời trang', slug: 'thoi-trang', description: 'Quần áo, giày dép...' });

    await manager.save([catElec, catFashion]);
    console.log('✅ Đã tạo Categories');

    // 4. Tạo Products & Inventory
    const product1 = manager.create(Product, {
        name: 'iPhone 15 Pro Max',
        slug: 'iphone-15-pro-max',
        description: 'Titan tự nhiên, 256GB',
        price: 30000000,
        images: ['https://example.com/iphone.jpg'],
        category: catElec,
        seller: seller,
        isActive: true
    });
    const savedProduct1 = await manager.save(product1);

    // Tạo Inventory cho Product 1
    const inv1 = manager.create(Inventory, { product: savedProduct1, quantity: 100, location: 'Kho HCM' });
    await manager.save(inv1);

    const product2 = manager.create(Product, {
        name: 'Áo thun Coolmate',
        slug: 'ao-thun-coolmate',
        description: 'Cotton 100%',
        price: 200000,
        images: ['https://example.com/ao.jpg'],
        category: catFashion,
        seller: seller,
        isActive: true
    });
    const savedProduct2 = await manager.save(product2);

    // Tạo Inventory cho Product 2
    const inv2 = manager.create(Inventory, { product: savedProduct2, quantity: 50, location: 'Kho HN' });
    await manager.save(inv2);

    console.log('✅ Đã tạo Products & Inventory');

    // 5. Tạo Coupon
    const coupon = manager.create(Coupon, {
        code: 'GIAMGIA50',
        type: CouponType.PERCENTAGE,
        value: 50, // Giảm 50%
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Hết hạn sau 30 ngày
        isActive: true
    });
    await manager.save(coupon);
    console.log('✅ Đã tạo Coupon: GIAMGIA50');

    await app.close();
}
bootstrap();