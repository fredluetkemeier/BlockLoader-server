const fetch = require('node-fetch');
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull,
} = require('graphql');
const { ModType } = require('./types/Mod');

module.exports = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'Query',
        description: 'The root query object',

        fields: () => ({
            mod: {
                type: GraphQLNonNull(ModType),
                args: {
                    id: { type: GraphQLString },
                },
                resolve: (root, args) =>
                    fetch(
                        `https://addons-ecs.forgesvc.net/api/v2/addon/${args.id}`
                    ).then((response) => response.json()),
            },
            mods: {
                type: GraphQLNonNull(GraphQLList(ModType)),
                args: {
                    ids: { type: GraphQLList(GraphQLString) },
                },
                resolve: (root, args) =>
                    fetch(`https://addons-ecs.forgesvc.net/api/v2/addon`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(args.ids),
                    }).then((response) => response.json()),
            },
        }),
    }),
});
