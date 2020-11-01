import { ObjectType, Field } from "type-graphql";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, BaseEntity, OneToMany } from "typeorm";
import { Post } from "./Post";

@ObjectType()
@Entity()
export class User extends BaseEntity{

  @Field()
  @PrimaryGeneratedColumn()
  id!: number;
  
  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field()
  @Column({unique: true})
  username!: string;
  
  @Field()
  @Column({type: "int", default: 0})
  points!: number;
  
  @Field()
  @Column({unique: true})
  email!: string;
  
  @Column()
  password!: string;
  
  @Field()
  @Column()
  creator!: number;

  @OneToMany(() => Post, post => post.creator)
  posts: Post[];

}