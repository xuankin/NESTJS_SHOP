import {Injectable, NotFoundException} from '@nestjs/common';
import {CartItemRepository, CartRepository} from "./repositories/cart.repository";
import {ProductRepository} from "../products/repositories/product.repository";
import { AddToCartDto, CartResponseDto, UpdateCartItemDto } from './dto/cart.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CartService {
    constructor(private readonly cartRepository :CartRepository,
                private readonly cartItemRepository: CartItemRepository,
                private readonly productRepository:ProductRepository,) {}
  private toResponseDto(cart: any): CartResponseDto {
    return plainToInstance(CartResponseDto, cart, { excludeExtraneousValues: true });
  }
    async getCart(userId :string){
        let cart = await  this.cartRepository.findByUserId(userId);
        if(!cart){
             cart =  this.cartRepository.create({user:{id:userId,},items:[]});
            await this.cartRepository.save(cart);
        }
        return this.toResponseDto(cart);

    }
   async addToCart(userId :string,addToCartDto:AddToCartDto){
        let cart = await this.getCart(userId);
        let product = await this.productRepository.findOneBy({id:addToCartDto.productId});
        if(!product){
            throw new NotFoundException('Product not found');
        }
        let cartItem = await this.cartItemRepository.findOne({
            where:{cart:{id:cart.id},product:{id:product.id}}
        });
        if(cartItem){
           cartItem.quantity += addToCartDto.quantity;
        }else{
            cartItem = this.cartItemRepository.create({
                cart,
                product,
                quantity: addToCartDto.quantity,
            })
        }
        await this.cartItemRepository.save(cartItem);
        return this.toResponseDto(cart);
   }
   async updateItem(userId:string,itemId:string,updateCartItemDto:UpdateCartItemDto){
       let cartItem = await this.cartItemRepository.findOne({
           where:{id:itemId,cart:{user:{id:userId}}}
       })
       if(!cartItem){
           throw new NotFoundException('CartItem not found');
       }
       cartItem.quantity = updateCartItemDto.quantity;
       await this.cartItemRepository.save(cartItem);
       return this.getCart(userId);
   }
   async removeItem(userId:string,itemId:string){
         await this.cartItemRepository.delete({id:itemId,cart:{user:{id:userId}}})
        return this.getCart(userId);
   }
   async clearItem(userId:string){
        const cart = await this.getCart(userId);
         await this.cartItemRepository.delete({cart:{id:cart.id}});
   }
}
