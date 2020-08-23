const fetch = require('node-fetch');
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull,
    GraphQLEnumType,
} = require('graphql');
const { ModType } = require('./types/Mod');

const MINECRAFT_GAME_ID = '432';
const MODS_SECTION_ID = '6';

const CategoryType = new GraphQLEnumType({
    name: 'Category',
    description: 'A section category, used to filter mods',

    values: {
        NONE: { value: '' },
        FABRIC: { value: '4780' },
    },
});

const QueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'The root query object',

    fields: () => ({
        mod: {
            type: ModType,
            args: {
                id: { type: GraphQLNonNull(GraphQLString) },
            },
            resolve: (root, args) =>
                fetch(
                    `https://addons-ecs.forgesvc.net/api/v2/addon/${args.id}`
                ).then((response) => response.json()),
        },
        mods: {
            type: GraphQLList(ModType),
            args: {
                ids: { type: GraphQLNonNull(GraphQLList(GraphQLString)) },
            },
            resolve: (root, args) =>
                fetch(`https://addons-ecs.forgesvc.net/api/v2/addon`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(args.ids),
                }).then((response) => response.json()),
        },
        findMods: {
            type: GraphQLNonNull(GraphQLList(ModType)),
            args: {
                searchTerm: { type: GraphQLString, defaultValue: '' },
                category: {
                    type: CategoryType,
                    defaultValue: CategoryType.NONE,
                },
                gameVersion: { type: GraphQLString, defaultValue: '' },
                page: { type: GraphQLString, defaultValue: '1' },
                pageSize: { type: GraphQLString, defaultValue: '10' },
            },
            resolve: (
                root,
                { searchTerm, category, gameVersion, page, pageSize }
            ) => {
                const index = (page - 1) * pageSize;

                const query = `gameId=${MINECRAFT_GAME_ID}&sectionId=${MODS_SECTION_ID}&searchFilter=${searchTerm}&categoryId=${category}&gameVersion=${gameVersion}&index=${index}&pageSize=${pageSize}`;

                return fetch(
                    `https://addons-ecs.forgesvc.net/api/v2/addon/search?${query}`
                ).then((response) => response.json());
            },
        },
    }),
});

module.exports = new GraphQLSchema({ query: QueryType });
