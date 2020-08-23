const { GraphQLObjectType, GraphQLString, GraphQLList } = require('graphql');
const { moment } = require('moment');

const ModType = new GraphQLObjectType({
    name: 'Mod',
    description: 'A minecraft mod',

    fields: () => ({
        id: {
            type: GraphQLString,
            resolve: (mod) => mod.id,
        },
        name: {
            type: GraphQLString,
            resolve: (mod) => mod.name,
        },
        authors: {
            type: GraphQLList(AuthorType),
            resolve: (mod) => mod.authors,
        },
        thumbnail: {
            type: ThumbnailType,
            resolve: (mod) =>
                mod.attachments.find((attachment) => attachment.isDefault) ||
                attachments[0],
        },
        externalLink: {
            type: GraphQLString,
            resolve: (mod) => mod.websiteUrl,
        },
        summary: {
            type: GraphQLString,
            resolve: (mod) => mod.summary,
        },
        downloadCount: {
            type: GraphQLString,
            resolve: (mod) => mod.downloadCount,
        },
        files: {
            type: GraphQLList(FileType),
            resolve: (mod) => mod.latestFiles,
        },
    }),
});

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'The author of a mod',

    fields: () => ({
        id: {
            type: GraphQLString,
            resolve: (author) => author.id,
        },
        name: {
            type: GraphQLString,
            resolve: (author) => author.name,
        },
    }),
});

const ThumbnailType = new GraphQLObjectType({
    name: 'Thumbnail',
    description: 'The thumbnail belonging to a mod',

    fields: () => ({
        id: {
            type: GraphQLString,
            resolve: (thumbnail) => thumbnail.id,
        },
        url: {
            type: GraphQLString,
            resolve: (thumbnail) => thumbnail.thumbnailUrl,
        },
        title: {
            type: GraphQLString,
            resolve: (thumbnail) => thumbnail.title,
        },
    }),
});

const FileType = new GraphQLObjectType({
    name: 'File',
    description: 'A mod file available to download',

    fields: () => ({
        id: {
            type: GraphQLString,
            resolve: (file) => file.id,
        },
        name: {
            type: GraphQLString,
            resolve: (file) => file.fileName,
        },
        date: {
            type: GraphQLString,
            resolve: (file) => moment(file.fileDate).format('X'),
        },
        url: {
            type: GraphQLString,
            resolve: (file) => file.downloadUrl,
        },
        minecraftVersion: {
            type: GraphQLString,
            resolve: (file) => {
                const [newest] = file.sortableGameVersion
                    .sort((a, b) => {
                        const timestampA = toPosixTime(a);
                        const timestampB = toPosixTime(b);

                        if (timestampA == timestampB) {
                            return 0;
                        }

                        return timestampA < timestampB ? 1 : -1;
                    })
                    .map((entry) => entry.gameVersion);

                return newest;
            },
        },
    }),
});

function toPosixTime(timestamp) {
    return moment(timestamp).format('X');
}

module.exports = {
    ModType,
};
