import { Injectable } from '@nestjs/common';
import { NotificationsRepository } from "./repositories/notification.repository";
import { CreateNotificationDto, NotificationResponseDto } from './dto/notifications.dto';
import { NotificationsGateway } from './notifications.gateway';
import {UserRepository} from "../users/repositories/user.repository";
import { plainToInstance } from 'class-transformer'; // Import Gateway

@Injectable()
export class NotificationsService {
    constructor(
        private readonly notificationsRepository: NotificationsRepository,
        private readonly notificationsGateway: NotificationsGateway ,
        private readonly userRepository: UserRepository
    ) {}
    private toResponseDto(data: any): any {
        return plainToInstance(NotificationResponseDto, data, { excludeExtraneousValues: true });
    }
    async create(userId: string, dto: CreateNotificationDto) {

        const noti = this.notificationsRepository.create({
            user: { id: userId },
            ...dto
        });
        const savedNoti = await this.notificationsRepository.save(noti);


        this.notificationsGateway.sendNotificationToUser(userId, savedNoti);

        return this.toResponseDto(noti)
    }

    async getUserNotifications(userId: string) {
        let myNotis = this.notificationsRepository.findByUserId(userId);
        return this.toResponseDto(myNotis);
    }

    async markAsRead(id: string) {
        await this.notificationsRepository.update(id, { isRead: true });
    }
    async createBroadcast(dto: CreateNotificationDto) {

        this.notificationsGateway.broadcastNotification({
            ...dto,
            createdAt: new Date(),
            isRead: false
        });



        const allUsers = await this.userRepository.find({ select: ['id'] });

        const notificationsData = allUsers.map(user =>
            this.notificationsRepository.create({
                user: { id: user.id },
                title: dto.title,
                message: dto.message,
                type: dto.type,
                metadata: dto.metadata,
                isRead: false
            })
        );


        if (notificationsData.length > 0) {
            await this.notificationsRepository.save(notificationsData);
        }
    }
}