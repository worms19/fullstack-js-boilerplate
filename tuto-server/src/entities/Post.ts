import { ObjectType, Field } from "type-graphql";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, BaseEntity, ManyToOne } from "typeorm";
import { User } from "./User";



@ObjectType()
@Entity()
export class Post extends BaseEntity {

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
  @Column()
  title!: string;
  
  @Field()
  @Column()
  text!: string;
  
  @Field()
  @Column()
  creatorId!: string;

  @ManyToOne(() => User, user => user.posts)
  creator: User;

}