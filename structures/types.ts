import { ApplicationCommandOptionType } from 'discord.js'

export type Language =
    | 'english'
    | 'portuguese'
    | 'spanish'
    | 'korean'
    | 'japanese'
    | string
    | null
    | undefined

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

export type Permissions = {
    [key in ChannelMethods]: any;
}          

export type TRoomPermission = 'TRCHANNEL_OWNER' | 'TRCHANNEL_ADMIN'

export type CommandChoices = {
    name: string,
    value: string
}

export type CommandOptions = {
    name: string
    description: string,
    required: boolean,
    type: ApplicationCommandOptionType,
    choices?: Array <CommandChoices>
}

export type BotGuild = {
    serverId: string,
    language: Language,
    categoryId: string | null,
    channelId: string | null
}
