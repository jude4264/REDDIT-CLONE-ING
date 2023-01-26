import { BaseEntity, CreateDateColumn, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export default abstract class  Entity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: Number

    @CreateDateColumn()
    createAt : Date

    @UpdateDateColumn()
    updateAt: Date
    
}