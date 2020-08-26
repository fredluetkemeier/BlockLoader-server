const express = require('express');
const { ApolloServer } = require('apollo-server-express');

const PORT = 4000;

const { typeDefs, resolvers } = require('./schema');

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

const app = express();
server.applyMiddleware({ app });

app.listen({ port: PORT }, () =>
    console.log(`Server ready at http://localhost:${PORT}${server.graphqlPath}`)
);
