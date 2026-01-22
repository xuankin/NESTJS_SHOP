import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {UserRepository} from "./repositories/user.repository";
import {CreateUserDto, UpdateUserDto, UserResponseDto} from "./dto/user.dto";
import {User} from "./entities/user.entity";
import * as bcrypt from 'bcrypt';
import {plainToInstance} from "class-transformer";

@Injectable()
export class UsersService {
    constructor(private readonly userRepository:UserRepository ) {}

    private toResponseDto(user: User): UserResponseDto {
        return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });
    }

    async  create(createUserDto :CreateUserDto){
        const existingUser = await this.userRepository.findByName(createUserDto.username);
        if(existingUser){
            throw new NotFoundException('User already exists');
        }
        const existingEmail = await this.userRepository.findByEmail(createUserDto.email);
        if(existingEmail){
            throw new BadRequestException('Email already exists');
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
        const newUser = await this.userRepository.create({
            ...createUserDto,
            password: hashedPassword,
        });
        const savedUser = await this.userRepository.save(newUser);
        return this.toResponseDto(savedUser);
    }
    async findOne(id:string){
        const user =await this.userRepository.findOne({where:{id}});
        if(!user){
            throw new NotFoundException('User not found');
        }
        return this.toResponseDto(user);
    }
    async findByEmail(email:string){
        const user = await this.userRepository.findOne({where:{email}});
        if(!user){
            throw new NotFoundException('User not found');
        }
        return this.toResponseDto(user);
    }
    async findByName(userName:string){
        const user = await this.userRepository.findByName(userName);
        if(!user){
            throw new NotFoundException('User not found');
        }
        return this.toResponseDto(user);
    }
    async update(id:string,updateUserDto:UpdateUserDto){
        const userUpdate = await this.userRepository.findOne({where:{id}});
        if(!userUpdate){
            throw new NotFoundException('User not found');
        }
        Object.assign(userUpdate, updateUserDto);
        await this.userRepository.save(userUpdate);
        return userUpdate

    }
    async delete(id:string){
        const user = await this.findOne(id);
        if(!user){
            throw new NotFoundException('User not found');
        }
        await this.userRepository.delete(id);
        return user
    }

}
