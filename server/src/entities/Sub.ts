import { Expose } from "class-transformer";
import { Column, Entity, Index, JoinColumn, ManyToMany, ManyToOne, OneToMany } from "typeorm";
import BaseEntity  from "./Entiity";
import Post from "./Post";
import { User } from "./User";

@Entity('subs')
export default class Sub extends BaseEntity{
    
    @Index()
    @Column({unique: true})
    name : String

    @Column()
    title : String

    @Column({type: 'text' , nullable : true})
    description : String

    @Column({nullable: true})
    imageUrn : String

    @Column({nullable : true})
    bannerUrn : String

    @Column()
    username : String;

    @ManyToOne(()=>User)
    @JoinColumn({name : "username", referencedColumnName : "username"})
    user : User;

    @OneToMany(()=>Post, (post)=> post.sub)
    posts : Post[]

    @Expose()
    get imageUrl() : String {
        return this.imageUrn ? `${process.env.APP_URL}/images/${this.imageUrn}` : 
        "https://www.gravatar.com/avatar?d=mp&f=y"
    }

    @Expose()
    get bannerUrl() : string {
        return this.bannerUrn ? `${process.env.APP_URL}/images/${this.bannerUrn}` : 
        undefined;
    }
    
}