import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class CreateNotificationDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    message: string;

    @IsNotEmpty()
    @IsString()
    type: string;

    @IsOptional()
    metadata?: any;
}

export class UpdateNotificationStatusDto {
    @IsNotEmpty()
    @IsBoolean()
    isRead: boolean;
}
export class NotificationResponseDto {
    @Expose() id: string;
    @Expose() title: string;
    @Expose() message: string;
    @Expose() type: string;
    @Expose() isRead: boolean;
    @Expose() metadata: any;
    @Expose() createdAt: Date;
}