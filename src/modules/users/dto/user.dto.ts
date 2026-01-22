
import { PartialType } from '@nestjs/mapped-types';
import {IsEnum, IsOptional, IsString, IsPhoneNumber, MinLength, IsNotEmpty, IsEmail} from 'class-validator';
import { UserRole } from '../entities/user.entity';
import {Expose} from "class-transformer";

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsOptional()
    @MinLength(6)
    password: string;

    @IsOptional()
    @IsString()
    fullName?: string;

    @IsOptional()
    @IsPhoneNumber('VN')
    phoneNumber?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @IsOptional()
    avatar?: string;
}
export class UserResponseDto{
    @Expose()
    id: string;

    @Expose()
    username: string;

    @Expose()
    email: string;

    @Expose()
    fullName: string;

    @Expose()
    phoneNumber: string;

    @Expose()
    address: string;

    @Expose()
    avatar: string;

    @Expose()
    role: string;

    @Expose()
    isActive: boolean;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}