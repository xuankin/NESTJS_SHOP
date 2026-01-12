import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { AbstractEntity } from "../../../common/entities/abstract.entity";
import { User } from "../../users/entities/user.entity";

@Entity('notifications')
export class Notification extends AbstractEntity {
    @Column()
    title: string;

    @Column({ type: 'text' })
    message: string;

    @Column({ default: false })
    isRead: boolean;

    @Column()
    type: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: any;

    @ManyToOne(() => User, (user) => user.notifications)
    @JoinColumn({ name: 'user_id' })
    user: User;
}