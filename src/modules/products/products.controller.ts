import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFiles, UseInterceptors, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/products.dto';
import { PaginationDTO } from '../../common/dtos/pagination.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {Roles} from "../auth/decorators/role.decorator";
import {UserRole} from "../users/entities/user.entity";
import {Public} from "../../common/decorators/public.decorator";

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Post()
    @Roles(UserRole.SELLER, UserRole.ADMIN)
    @UseInterceptors(FilesInterceptor('images', 5, {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = extname(file.originalname);
                callback(null, `${uniqueSuffix}${ext}`);
            },
        }),
        fileFilter: (req, file, callback) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) return callback(new BadRequestException('Only images allowed'), false);
            callback(null, true);
        },
    }))
    create(
        @Body() createProductDto: CreateProductDto,
        @UploadedFiles() files: Array<Express.Multer.File>,
        @Query('userId') userId: string
    ) {
        if (files && files.length > 0) {
            createProductDto.images = files.map(f => `uploads/${f.filename}`);
        }
        return this.productsService.create(createProductDto, userId); 
    }

    @Get()
    @Public()
    findAll(
        @Query() pagination: PaginationDTO,
        @Query('search') search?: string,
        @Query('categoryId') categoryId?: string,
    ) {
        return this.productsService.findAll(pagination.page, pagination.limit, search, categoryId);
    }

    @Get(':id')
    @Public()
    findOne(@Param('id') id: string) {
        return this.productsService.findOne(id);
    }

    @Get('slug/:slug')
    @Public()
    findBySlug(@Param('slug') slug: string) {
        return this.productsService.findBySlug(slug);
    }

    @Patch(':id')
    @Roles(UserRole.SELLER, UserRole.ADMIN)
    update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
        return this.productsService.update(id, updateProductDto);
    }

    @Delete(':id')
    @Roles(UserRole.SELLER, UserRole.ADMIN)
    remove(@Param('id') id: string) {
        return this.productsService.remove(id);
    }
}