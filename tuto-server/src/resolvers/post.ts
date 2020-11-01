import { isAuth } from './../middleware/isAuth';
import { MyContext } from 'src/types';
import { Post } from '../entities/Post';
import { Resolver, Query, Ctx, Arg, Int, Mutation, InputType, Field, UseMiddleware } from "type-graphql";
import { BaseEntity } from 'typeorm';

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}
@Resolver()
export class PostResolver extends BaseEntity {
    
    @Query(() => [Post])
    async posts(): Promise<Post[]>{
        return Post.find();
    }
    @Query(() => Post, {nullable: true})
    post(
        @Arg('id', () => Int) id: number): Promise<Post | undefined > {
        return Post.findOne(id);
    }

    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(
        @Arg("input") input: PostInput,
        @Ctx() {req}: MyContext
        ): Promise<Post> {
        return Post.create({
            ...input,
            creatorId: req.session.userId,
        }).save();
    }
    @Mutation(() => Post, {nullable: true})
    async updatePost(
        @Arg("id") id: number,
        @Arg("title", () => String, {nullable: true}) title: string,
        ): Promise<Post | null> {
        const post = await Post.findOne(id)
        if(!post){
            return null;
        }
        if(typeof title !== undefined){
            await Post.update({id}, {title})
        }
        return post;

    }
    @Mutation(() => Boolean)
    async deletePost(
        @Arg("id") id: number): Promise<boolean> {
             await Post.delete(id);
             return true
        }
    
}