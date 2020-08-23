const express = require('express');
const path = require('path');
const { graphqlHTTP } = require('express-graphql');

const PORT = 4000;

const app = express();
const schema = require('./schema');

app.post(
    '/graphql',
    graphqlHTTP({
        schema,
        graphiql: false,
    })
);

app.get(
    '/graphql',
    graphqlHTTP({
        schema,
        graphiql: true,
    })
);

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
    console.log(`Graphiql interface at http://localhost:${PORT}/graphql`);
});
