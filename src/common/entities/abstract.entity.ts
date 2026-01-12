import {CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";

export abstract class AbstractEntity {
        @PrimaryGeneratedColumn('uuid')
        id : string
        @CreateDateColumn()
        CreatedAt: Date
        @UpdateDateColumn()
        UpdatedAt: Date
        @DeleteDateColumn()
        deletedAt: Date
}

