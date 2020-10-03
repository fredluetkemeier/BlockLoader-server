const express = require('express');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const responseCachePlugin = require('apollo-server-plugin-response-cache');

const PORT = 4000;

const { typeDefs, resolvers } = require('./schema');

const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [responseCachePlugin()],
    cacheControl: {
        defaultMaxAge: 300,
    },
});

const app = express();
app.use(cors());
server.applyMiddleware({ app });

app.listen({ port: PORT }, () =>
    console.log(`Server ready at http://localhost:${PORT}${server.graphqlPath}`)
);
