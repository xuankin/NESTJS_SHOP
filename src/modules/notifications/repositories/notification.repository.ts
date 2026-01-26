import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import {Notification} from "../entities/notification.entity";

@Injectable()
export class NotificationsRepository extends Repository<Notification> {
    constructor(private dataSource: DataSource) {
        super(Notification, dataSource.createEntityManager());
    }

    async findByUserId(userId: string, limit = 20): Promise<Notification[]> {
        return this.find({
            where: { user: { id: userId } },
            order: { createdAt: 'DESC' },
            take: limit
        });
    }

    async countUnread(userId: string): Promise<number> {
        return this.count({
            where: { user: { id: userId }, isRead: false }
        });
    }
}