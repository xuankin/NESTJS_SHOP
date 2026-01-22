import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsRepository } from './repositories/notification.repository';
import { NotificationsGateway } from './notifications.gateway'; // Import mới
import { JwtModule } from '@nestjs/jwt'; // Import JWT
import { ConfigModule, ConfigService } from '@nestjs/config';
import {UsersModule} from "../users/users.module";
import { UserRepository } from '../users/repositories/user.repository';

@Module({
  imports: [

    JwtModule.registerAsync({
      imports: [ConfigModule,],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
    ConfigModule,
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsRepository,
    NotificationsGateway,
    UserRepository
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}