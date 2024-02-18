import { CategoryChannel, Guild, VoiceChannel } from 'discord.js';
import { guildScheme } from '../database/schemes/guildScheme';
import { Language } from '../structures/types';

export class GuildManager {
    public guild: Guild;

    constructor(guild: Guild) {
        this.guild = guild;
    }

    async getGuild() {
        let guildData = await guildScheme.findOne({ serverId: this.guild.id }).exec();
        if (!guildData) guildData = await this.create('english');
        
        return guildData;
    }

    async create(language: Language) {
        const guildData = await guildScheme.create({
            serverId: this.guild.id,
            language,
            categoryId: null,
            channelId: null,
        });
        await guildData.save().catch((err: Error) => console.log(err));
        return guildData;
    }

    async delete(): Promise<void> {
        await guildScheme.deleteOne({ serverId: this.guild.id });
    }

    async getLanguage(): Promise<Language | string | null | undefined> {
        const guildData = await this.getGuild()
        return guildData?.language;
    }

    async getTrChannels(): Promise<{ trcategory: CategoryChannel | undefined, trchannel: VoiceChannel | undefined }> {
        const guildData = await this.getGuild();
        const categoryId = guildData?.categoryId;
        const channelId = guildData?.channelId;

        let trcategory: CategoryChannel | undefined;
        let trchannel: VoiceChannel | undefined;

        if (categoryId) trcategory = this.guild.channels.cache.get(categoryId) as CategoryChannel;
        if (channelId) trchannel = this.guild.channels.cache.get(channelId) as VoiceChannel;

        return { trcategory, trchannel };
    }

    async changeLanguage(language: Language): Promise<void> {
        const guildData = await this.getGuild();
        await guildData?.updateOne({ language });
        await guildData?.save().catch((err: Error) => console.log(err));
    }

    async trSetup(categoryID: string | null, channelID: string | null): Promise<void> {
        const guildData = await this.getGuild();
        await guildData?.updateOne({ categoryId: categoryID, channelId: channelID });
        await guildData?.save().catch((err: Error) => console.log(err));
    }
}
