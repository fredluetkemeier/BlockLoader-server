const { gql } = require('apollo-server-express');
const fetch = require('node-fetch');
const moment = require('moment');

const MINECRAFT_GAME_ID = '432';
const MODS_SECTION_ID = '6';

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
        ): [Mod!]! @cacheControl(maxAge: 600)
    }

    type Mod {
        id: ID!
        name: String!
        authors: [Author!]!
        thumbnail: Thumbnail!
        externalLink: String!
        summary: String!
        downloadCount: String!
        files: [File!]!
        latestFile: File!
        popularity: Float!
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

    Mod: {
        id: (parent) => parent.id,
        name: (parent) => parent.name,
        authors: (parent) => parent.authors,
        thumbnail: (parent) =>
            parent.attachments.find((attachment) => attachment.isDefault) ||
            attachments[0],
        externalLink: (parent) => parent.websiteUrl,
        summary: (parent) => parent.summary,
        downloadCount: (parent) => parent.downloadCount,
        files: (parent) =>
            fetch(
                `https://addons-ecs.forgesvc.net/api/v2/addon/${parent.id}/files`
            )
                .then((response) => response.json())
                .then((files) => files.sort(fileByDate)),
        latestFile: (parent) =>
            fetch(
                `https://addons-ecs.forgesvc.net/api/v2/addon/${parent.id}/files`
            )
                .then((response) => response.json())
                .then((files) => files.sort(fileByDate))
                .then((files) => (files.length > 0 ? files[0] : [])),
        popularity: (parent) => parent.popularityScore,
    },

    Author: {
        id: (parent) => parent.id,
        name: (parent) => parent.name,
    },

    Thumbnail: {
        id: (parent) => parent.id,
        url: (parent) => parent.thumbnailUrl,
        title: (parent) => parent.title,
    },

    File: {
        id: (parent) => parent.id,
        name: (parent) => parent.fileName.trim(),
        date: (parent) => parent.fileDate,
        url: (parent) => parent.downloadUrl,
        minecraftVersion: (parent) => parent.gameVersion[0],
    },
};

module.exports = { typeDefs, resolvers };

function toPosixTime(timestamp) {
    return moment(timestamp).format('X');
}

function fileByDate({ fileDate: a }, { fileDate: b }) {
    const posixA = toPosixTime(a);
    const posixB = toPosixTime(b);

    if (posixA == posixB) {
        return 0;
    }

    return posixA < posixB ? 1 : -1;
}
