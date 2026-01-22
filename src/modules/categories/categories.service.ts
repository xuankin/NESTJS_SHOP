import {Injectable, NotFoundException} from '@nestjs/common';
import {CategoriesRepository} from "./repositories/category.repository";
import { CategoryResponseDto, CreateCategoryDto, UpdateCategoryDto } from './dto/categories.dto';
import slugify from 'slugify';
import { plainToInstance } from 'class-transformer';
import { NotificationResponseDto } from '../notifications/dto/notifications.dto';

@Injectable()
export class CategoriesService {
    constructor(private readonly categoriesRepository: CategoriesRepository) {}
  private toResponseDto(data: any): any {
    return plainToInstance(CategoryResponseDto, data, { excludeExtraneousValues: true });
  }
  async create(createCategoryDto: CreateCategoryDto){
        const slug = slugify(createCategoryDto.name,{lower:true});
        let parent : any ;
        if(createCategoryDto.parentId){
            parent = await this.categoriesRepository.findOne({where:{id:createCategoryDto.parentId}});
        }
        const categories = await this.categoriesRepository.create({
            ...createCategoryDto,
            parent,
            slug
        })
      let savedCategory = this.categoriesRepository.save(categories);
        return this.toResponseDto(savedCategory);

  }
  async findOne(id:string){
        const category = await this.categoriesRepository.findOne({where:{id:id}});
        if(!category){
            throw new NotFoundException("Category not found");
        }
        return this.toResponseDto(category);
  }
  async findAll(){
        const category =  this.categoriesRepository.find();
        return this.toResponseDto(category);
  }
  async update(id:string,updateCategoryDto:UpdateCategoryDto){
        await this.findOne(id);
        return this.categoriesRepository.update(id, updateCategoryDto);
  }
  async remove(id:string){
        await this.categoriesRepository.delete(id);
  }
}
