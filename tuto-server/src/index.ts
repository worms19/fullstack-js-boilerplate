import { UserResolver } from './resolvers/user';
import "reflect-metadata";
import { __prod__ } from './constants';
import { MikroORM } from "@mikro-orm/core"
import microConfig from './mikro-orm.config'
import express from 'express'
import {ApolloServer} from 'apollo-server-express'
import { PostResolver } from './resolvers/post';
import { buildSchema } from 'type-graphql'
import { HelloResolver } from './resolvers/hello';
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import cors from 'cors'




const main = async () => {
    const orm = await MikroORM.init(microConfig);
    console.log('node env', process.env.NODE_ENV)
    console.log('node env', __prod__)
    await orm.getMigrator().up();
    
    const app = express();

    let RedisStore = connectRedis(session)
    let redisClient = redis.createClient()

    app.use(
        cors({
            origin: 'http://localhost:3000',
            credentials: true
        })
    )

    app.use(
        session({
            saveUninitialized: false,
          name: 'qid',
          store: new RedisStore({ 
            client: redisClient,
            disableTouch: true
        }),
         cookie:{
             maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10 years in ms 
             httpOnly: true,
             secure: __prod__,
             sameSite: 'lax' //csrf
         },
          secret: 'dfgskjgdfkjjkgfdjmsgdf',
          resave: false,
        })
      )

    const AppoloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({req, res}) => ({ em: orm.em, req, res})
    });

    AppoloServer.applyMiddleware({
            app,
            cors: false
        });

    app.listen(4000, () =>{
        console.log('server started on localhost:4000 and graphQl')
    })
};

main();

console.log('test')
