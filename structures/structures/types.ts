// All of the languages that the bot have support. If you want to contribute with
// the bot translation adding a new language, have sure to put the language below:
export type Language =
    | 'english'
    | 'portuguese'
    | 'spanish'
    | 'korean'
    | 'japanese'

export type ChannelMethods =
    | 'ADD_MEMBER'
    | 'REMOVE_MEMBER'
    | 'ADD_ADMIN'
    | 'REMOVE_ADMIN'
    | 'BLOCK_MEMBER'
    | 'UNBLOCK_MEMBER'
    | 'RENAME'
    | 'LOCK'
    | 'UNLOCK'
    | 'HIDE'
    | 'UNHIDE'

export type TRoomPermission = 'TRCHANNEL_OWNER' | 'TRCHANNEL_ADMIN'

export type CommandTypes =
    | 'STRING'
    | 'BOOLEAN'
    | 'NUMBER'
    | 'INTEGER'
    | 'USER'
    | 'MENTIONABLE'
    | 'ROLE'
    | 'CHANNEL'
    | 'SUB_COMMAND'
    | 'SUB_COMMAND_GROUP'

export type CommandChoices = {
    name: string,
    value: string
}

export type CommandOptions = {
    name: string
    description: string,
    required: boolean,
    type: CommandTypes,
    choices?: Array <CommandChoices>
}

export type BadgeName =
    | 'Beta Tester'
    | "Violet's Best Friend <3"
    | 'Challenger'
    | 'The Magnata of Violets'
    | 'Translator'
    | 'Open source contributor'
    | 'Bug Hunter'

export type Badge = {
    name: BadgeName,
    date: string
}

export type BotGuild = {
    serverId: string,
    language: Language,
    categoryId: string | null,
    channelId: string | null
}
