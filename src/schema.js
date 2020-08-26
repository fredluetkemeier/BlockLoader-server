const fetch = require('node-fetch');
const { gql } = require('apollo-server-express');

const {
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

const typeDefs = gql`
    enum Category {
        ALL
        FABRIC
    }

    type Query {
        mod(id: String!): Mod!
        mods(ids: [String!]!): [Mod!]!
        findMods(
            searchTerm: String = ""
            category: Category = NONE
            gameVersion: String = ""
            page: Int = 1
            pageSize: Int = 10
        ): [Mod!]!
    }

    type Mod {
        id: ID!
        name: String!
        authors: Author!
        thumbnail: Thumbnail!
        externalLink: String!
        summary: String!
        downloadCount: String!
        files: File!
    }

    type Author {
        id: ID!
        name: String!
    }

    type Thumbnail {
        id: ID!
        url: String!
        title: String!
    }

    type File {
        id: ID!
        name: String!
        date: String!
        url: String!
        minecraftVersion: String!
    }
`;

const resolvers = {
    Category: {
        ALL: '',
        FABRIC: '4780',
    },
    Query: {
        mod: (parent, args) =>
            fetch(
                `https://addons-ecs.forgesvc.net/api/v2/addon/${args.id}`
            ).then((response) => response.json()),

        mods: (parent, args) =>
            fetch(`https://addons-ecs.forgesvc.net/api/v2/addon`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(args.ids),
            }).then((response) => response.json()),
        findMods: (
            parent,
            { searchTerm, category, gameVersion, page, pageSize }
        ) => {
            const index = (page - 1) * pageSize;

            const query = `gameId=${MINECRAFT_GAME_ID}&sectionId=${MODS_SECTION_ID}&searchFilter=${searchTerm}&categoryId=${category}&gameVersion=${gameVersion}&index=${index}&pageSize=${pageSize}`;

            return fetch(
                `https://addons-ecs.forgesvc.net/api/v2/addon/search?${query}`
            ).then((response) => response.json());
        },
    },
};

module.exports = { typeDefs, resolvers };
