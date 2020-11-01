import { MyContext } from './../types';
import { validateRegister } from './../utils/validateRegister';
import { User } from './../entities/User';
import { Resolver, Arg, Field, Ctx, Mutation, ObjectType, Query } from "type-graphql";
import argon2 from 'argon2'
import {EntityManager} from '@mikro-orm/postgresql'
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from '../constants';
import { UsernamePasswordInput } from './UsernamePasswordInput';
import { sendEmail } from '../utils/sendEmail';
import {v4} from 'uuid'
import {getConnection} from "typeorm";


@ObjectType()
class FieldError {
    @Field()
    field: string;
    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], {nullable: true})
    errors?: FieldError[];

    @Field(() => User, {nullable: true})
    user?: User;

}

@Resolver()
export class UserResolver {

    @Mutation(() => UserResponse)
    async ChangePassword(
        @Arg('token') token: string,
        @Arg("newPassword") newPassword: string,
        @Ctx() { redis, req }: MyContext
    ): Promise<UserResponse>{
        if(newPassword.length <= 3){
            return  {
                errors:
                [{
                    field: "password",
                    message: "length must be greater than 3"
                }]
            }
            
        }

        const key = FORGET_PASSWORD_PREFIX + token
        const userId = await redis.get(key);
        if(!userId){
            return  {
                errors:[ 
                    {
                    field: "token",
                    message: "expired token"
                    },
                ],
            };
         
          
        }
        const userIdNum = parseInt(userId)
        const user = await User.findOne(userIdNum);

        if(!user){
            return  {
                errors:[ 
                    {
                    field: "user",
                    message: "user doesn't exist"
                    },
                ],
            };
        }
        await User.update({id: userIdNum},{password: await argon2.hash(newPassword)});

        await redis.del(key)
        //log in after change password
        req.session.userId = user.id;

        return { user };
    }


    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('email') email : string,
        @Ctx() { redis} : MyContext
    ){
        const user = await User.findOne({where: { email }})
        if(!user){
            //email not in db
            return true
        }

        const token = v4();

        await redis.set(
            FORGET_PASSWORD_PREFIX + token,
            user.id,
            'ex',
            1000 * 60 * 60 * 24 * 3
        );

        await sendEmail(
            email,
            `<a href="http://localhost:3000/change-password/${token}"> reset password </a>`
        )
        return true;
    }

    @Query(()=> User, {nullable: true})
    async me(
        @Ctx() { req}: MyContext
    ){
        if(!req.session.userId){
            return null
        }
        return User.findOne(req.session.userId)
        
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('options', ()=> UsernamePasswordInput) options: UsernamePasswordInput

    ): Promise<UserResponse>{
        console.log('options', options)
        const errors = validateRegister(options);
        if (errors){
            return { errors };
        }
        console.log('prout')
        const hashPassword = await argon2.hash(options.password)
        let user;
        try{
            const result =
            await getConnection()
            .createQueryBuilder()
            .insert()
            .into(User)
            .values([
                { username: options.username,
                    email: options.email,
                    password: hashPassword,
                } 
            
            ])
            .returning("*")
            .execute();
           user = result.raw[0];
        }catch(err){
            console.log(err)
            if(err.code === '23502' || err.detail.includes("already exists")){
                return {
                    errors: [
                        {
                            field: "username",
                            message: "Username already taken"
                        }
                    ]
                }
                //duplicatioe error
            }
            console.log(err)
        }
        return {user};
    }
    @Mutation(() => UserResponse)
    async login(
        @Arg('userNameOrEmail') userNameOrEmail: string,
        @Arg('password') password: string,
        @Ctx() { req}: MyContext
    ): Promise<UserResponse>{
        const user = await User.findOne( userNameOrEmail.includes('@') ? { where :{username: userNameOrEmail} } : { where: { username: userNameOrEmail} } )
        if(!user){
            return{
                errors: [{
                    field: "userNameOrEmail",
                    message: "Username does not exist"
                }]
            }
        }
        const valid = await argon2.verify(user.password, password)
        if(!valid){
            return{
                errors: [{
                    field: "password",
                    message: "incorrect login"
                }]
            }
        }

        req.session.userId = user.id;
        return {user}
        
    }
    @Mutation(() => Boolean)
    async logout(
        @Ctx() { req, res }: MyContext
    ){
      return new Promise ((resolve) =>
        req.session.destroy((err) =>{
            res.clearCookie(COOKIE_NAME);
            if(err){
                console.log(err);
                resolve(false);
                return;
            }
            resolve(true)
        })
      );
    }

}