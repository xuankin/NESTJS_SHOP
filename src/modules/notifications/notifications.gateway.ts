import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class NotificationsGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer() server: Server;

    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    afterInit(server: Server) {
        console.log('socket ', 'NotificationsGateway Initialized');
    }

    async handleConnection(client: Socket) {
        try {

            const token =
                client.handshake.auth?.token ||
                client.handshake.headers?.authorization?.split(' ')[1];

            if (!token) {
                client.disconnect();
                return;
            }


            const secret = this.configService.get<string>('JWT_ACCESS_SECRET');
            const payload = this.jwtService.verify(token, { secret });


            const userId = payload.sub;
            await client.join(`user-${userId}`);

            console.log(`Client connected: ${client.id}, User: ${userId}`);
        } catch (error) {
            console.error('Socket authentication failed:', error.message);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }


    sendNotificationToUser(userId: string, notification: any) {

        this.server.to(`user-${userId}`).emit('new_notification', notification);
    }
    broadcastNotification(notification: any) {
        this.server.emit('new_notification', notification);
    }
}