import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import Redis from 'ioredis';
import {UserRepository} from "../users/repositories/user.repository";
import {UserRole} from "../users/entities/user.entity";

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        @Inject('REDIS_CLIENT') private readonly redis: Redis,
        private readonly userRepository : UserRepository
    ) {}



    async register(registerDto: RegisterDto) {
        const userToCreate = {
            ...registerDto,
            role: UserRole.USER
        };
        return this.usersService.create(userToCreate as any);
    }

    // Đăng nhập
    async login(loginDto: LoginDto) {

        const user = await this.userRepository.findByEmailForAuth(loginDto.username)
            || await this.userRepository.findByUsernameForAuth(loginDto.username);

        if (!user) throw new UnauthorizedException('Account or password is incorrect');




        const isMatch = await bcrypt.compare(loginDto.password, user.password);
        if (!isMatch) throw new UnauthorizedException('Account or password is incorrect');


        return this.generateTokens(user.id, user.role);
    }


    async refresh(dto: RefreshTokenDto) {
        try {
            // 1. Verify token gửi lên (để lấy thông tin user id)
            const payload = this.jwtService.verify(dto.refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });

            // 2. Kiểm tra trong Redis xem token này có khớp không
            const redisKey = `refresh_token:${payload.sub}`;
            const storedToken = await this.redis.get(redisKey);

            if (storedToken !== dto.refreshToken) {
                // Nếu token trong Redis khác token gửi lên -> Có thể đã bị xoay vòng hoặc bị tấn công
                throw new UnauthorizedException('Refresh token is invalid or has been used');
            }

            // 3. TOKEN ROTATION: Xóa token cũ ngay lập tức
            await this.redis.del(redisKey);

            // 4. Tạo cặp token mới (Access + Refresh mới)
            // Hàm generateTokens sẽ tự động lưu Refresh Token mới vào Redis
            const tokens = await this.generateTokens(payload.sub, payload.role);

            return tokens;
        } catch (e) {
            throw new UnauthorizedException('Token expired or invalid');
        }
    }


    async logout(userId: string) {
        await this.redis.del(`refresh_token:${userId}`);
        return { message: 'Signed out successfully' };
    }


    private async generateTokens(userId: string, role: string) {
        const payload = { sub: userId, role };

        const accessToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_ACCESS_SECRET || 'access-secret',
            expiresIn: '15m',
        });

        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
            expiresIn: '7d',
        });


        await this.redis.set(`refresh_token:${userId}`, refreshToken, 'EX', 7 * 24 * 60 * 60);

        return { accessToken, refreshToken };
    }
}