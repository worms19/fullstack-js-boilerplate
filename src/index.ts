import "reflect-metadata";
import { __prod__ } from './constants';
import { MikroORM } from "@mikro-orm/core"
import microConfig from './mikro-orm.config'
import express from 'express'
import {ApolloServer} from 'apollo-server-express'
import { PostResolver } from './resolvers/post';
import { buildSchema } from 'type-graphql'
import { HelloResolver } from './resolvers/hello';

const main = async () => {
    const orm = await MikroORM.init(microConfig);
    console.log('node env', process.env.NODE_ENV)
    console.log('node env', __prod__)
    await orm.getMigrator().up();
    
    const app = express();

    const AppoloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver],
            validate: false
        }),
        context: () => ({ em: orm.em})
    });

    AppoloServer.applyMiddleware({ app });

    app.listen(4000, () =>{
        console.log('server started on localhost:4000 and graphQl')
    })
};

main();

console.log('test')
