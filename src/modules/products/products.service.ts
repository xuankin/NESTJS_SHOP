import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesRepository } from '../categories/repositories/category.repository';
import { ProductRepository } from './repositories/product.repository';
import { InventoryRepository } from '../inventory/repositories/inventory.repository';
import { DataSource } from 'typeorm';
import { CreateProductDto, ProductResponseDto, UpdateProductDto } from './dto/products.dto';
import Redis from 'ioredis';
import slugify from "slugify";
import {Product} from "./entities/product.entity";
import {Inventory} from "../inventory/entities/inventory.entity";
import { plainToInstance } from 'class-transformer'; // Import Redis type

@Injectable()
export class ProductsService {
    constructor(
        private readonly productRepository: ProductRepository,
        private readonly categoryRepository: CategoriesRepository,
        private readonly inventoryRepository: InventoryRepository,
        private readonly dataSource: DataSource,
        @Inject('REDIS_CLIENT') private readonly redis: Redis, // Inject Redis
    ) {}

    private toResponseDto(product: Product | Product[]): any {
        return plainToInstance(ProductResponseDto, product, { excludeExtraneousValues: true });
    }
    async findAll(page: number, limit: number, search?: string, categoryId?: string) {

        const cacheKey = `products:list:p${page}:l${limit}:s-${search || ''}:c-${categoryId || ''}`;


        const cachedData = await this.redis.get(cacheKey);
        if (cachedData) {
            return JSON.parse(cachedData); // Return ngay nếu có
        }


        const {data,total}  = await this.productRepository.findAllWithPagination(page, limit, search, categoryId);
        const dataDto = this.toResponseDto(data);
        const result ={data:dataDto,total,page,limit,search};
        await this.redis.set(cacheKey, JSON.stringify(result),'EX',300);
    }


    async findOne(id: string) {
        const cacheKey = `product:id:${id}`;


        const cachedData = await this.redis.get(cacheKey);
        if (cachedData) {
            return JSON.parse(cachedData);
        }


        const product = await this.productRepository.findOne({
            where: { id },
            relations: ['category', 'inventory', 'reviews'],
        });

        if (!product) {
            throw new NotFoundException("Product not found");
        }
        const productDto = this.toResponseDto(product);
        await this.redis.set(`product:id:${id}`, JSON.stringify(productDto), 'EX', 3600);

        return productDto;
    }


    async findBySlug(slug: string) {
        const cacheKey = `product:slug:${slug}`;

        const cachedData = await this.redis.get(cacheKey);
        if (cachedData) {
            return JSON.parse(cachedData);
        }

        const product = await this.productRepository.findBySlug(slug);
        if (!product) {
            throw new NotFoundException("Product not found");
        }

        await this.redis.set(cacheKey, JSON.stringify(product), 'EX', 3600);
        return this.toResponseDto(product);
    }


    async create(createProductDto: CreateProductDto, sellerId: string) {
        const category = await this.categoryRepository.findOne({ where: { id: createProductDto.categoryId } });
        if (!category) {
            throw new NotFoundException("Category not found");
        }
        const slug = slugify(createProductDto.name, { lower: true, strict: true });
        const newProduct = await this.dataSource.transaction(async (manager) => {
            const product = manager.create(Product, {
                ...createProductDto,
                slug: slug,
                category,
                seller: { id: sellerId },
            });
            const savedProduct = await manager.save(product);
            const inventory = manager.create(Inventory, {
                product: savedProduct,
                quantity: createProductDto.initialStock || 0,
                location: 'Main Warehouse',
            });
            await manager.save(inventory);
            return savedProduct;
        });


        await this.clearListCache();

        return this.toResponseDto(newProduct)
    }


    async update(id: string, updateProductDto: UpdateProductDto) {
        const product = await this.productRepository.findOne({ where: { id } });
        if (!product) {
            throw new NotFoundException("Product not found");
        }

        Object.assign(product, updateProductDto);
        const updatedProduct = await this.productRepository.save(product);


        await this.redis.del(`product:id:${id}`);
        await this.redis.del(`product:slug:${product.slug}`);


        await this.clearListCache();

        return this.toResponseDto(updatedProduct);
    }


    async remove(id: string) {
        const product = await this.productRepository.findOne({ where: { id } });
        if (!product) {
            throw new NotFoundException("Product not found");
        }

        await this.productRepository.remove(product); // Dùng remove thay vì delete để trigger hooks nếu có

        await this.redis.del(`product:id:${id}`);
        await this.redis.del(`product:slug:${product.slug}`);
        await this.clearListCache();

        return { message: 'Product deleted successfully' };
    }
    private async clearListCache() {
        const keys = await this.redis.keys('products:list:*');
        if (keys.length > 0) {
            await this.redis.del(keys);
        }
    }
    async clearProductCache(productId: string) {
        await this.redis.del(`product:id:${productId}`);
        const keys = await this.redis.keys('products:list:*');
        if (keys.length > 0) await this.redis.del(keys);
    }
}