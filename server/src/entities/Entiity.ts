import { instanceToPlain } from "class-transformer";
import { BaseEntity, CreateDateColumn, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export default abstract class  Entity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: Number

    @CreateDateColumn()
    createdAt : Date

    @UpdateDateColumn()
    updatedAt: Date
    
    toJSON() {
        return instanceToPlain(this);
    }
    
}