import { MyContext } from "src/types";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { Updoot } from "../entities/Updoot";
import { Post } from "../entities/Post";
import { isAuth } from "./../middleware/isAuth";
import { User } from "../entities/User";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 30);
  }
  @FieldResolver(() => User)
  creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(post.creatorId);
  }
  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() post: Post,
    @Ctx() { updootLoader, req }: MyContext
  ) {
    if (!req.session.userId) {
      return null;
    }
    const updoot = await updootLoader.load({
      postId: post.id,
      userId: post.creatorId,
    });
    return updoot ? updoot.value : null;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Ctx() { req }: MyContext,
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;
    const replacements: any[] = [realLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    // const posts = await getConnection().query(
    //   `
    //         SELECT
    //         p.*,
    //         json_build_object('id', u.id,'username', u.username, 'email', u.email, 'createdAt', u."createdAt", 'updatedAt', u."updatedAt")  creator,
    //         ${
    //           req.session.userId
    //             ? '(SELECT value from updoot where "userId" = $2 AND "postId"= p.id) AS "voteStatus"'
    //             : 'null as "voteStatus"'
    //         }
    //         FROM post p
    //         INNER JOIN public.user u on u.id = p."creatorId"
    //         ${cursor ? `WHERE p."createdAt" < ${cursorIdx}` : ""}
    //         ORDER BY p."createdAt" DESC
    //         LIMIT $1
    //         `,
    //   replacements
    // );
    const posts = await getConnection().query(
      `
            SELECT 
            p.*
            FROM post p 
            ${cursor ? `WHERE p."createdAt" < $2` : ""}
            ORDER BY p."createdAt" DESC
            LIMIT $1
            `,
      replacements
    );

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }
  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    console.log(req.session.userId);
    return Post.create({
      ...input,
      creatorId: req.session.userId,
    }).save();
  }
  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title") title: string,
    @Arg("text") text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    // return Post.update({ id, creatorId: req.session.userId }, { title, text });
    const result = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id = :id and "creatorId" = :creatorId', {
        id,
        creatorId: req.session.userId,
      })
      .returning("*")
      .execute();

    return result.raw[0];
  }
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    // not cascade wait
    // const post = await Post.findOne(id);
    // if (!post) {
    //   return false;
    // }
    // if (post.creatorId !== req.session.userId) {
    //   throw new Error("Not auhtorized");
    // }
    // console.log(req.session.userId);
    // await Updoot.delete({ postId: id });
    // await Post.delete({ id });
    await Updoot.delete({ postId: id, creatorId: req.session.userId });
    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const isUpdoot = value !== -1;
    const realValue = isUpdoot ? 1 : -1;
    const { userId } = req.session;
    console.log(userId);
    const updoot = await Updoot.findOne({ where: { postId, userId } });

    if (updoot && updoot.value !== realValue) {
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
                        UPDATE updoot
                        set value = $1
                        WHERE "postId" = $2 AND "userId" = $3
                        `,
          [realValue, postId, userId]
        );
        await tm.query(
          `
                        UPDATE post
                        set points = $1
                        WHERE "id" = $2
                        `,
          [2 * realValue, postId]
        );
      });
    } else if (!updoot) {
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
                 INSERT INTO updoot ("userId", "postId", value)
                 values ($1, $2, $3);
                 `,
          [userId, postId, realValue]
        );
        await tm.query(
          `
                        UPDATE post p SET
                        points = points + $1
                        WHERE p.id = $2;
                 `,
          [realValue, postId]
        );
      });
    }

    return true;
  }
}
