const express = require('express');
const path = require('path');
const { graphqlHTTP } = require('express-graphql');

const PORT = 4000;

const app = express();
const schema = require('./schema');

app.use('*/dist', express.static(path.join(__dirname, '../../dist')));

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

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}...`);
});
