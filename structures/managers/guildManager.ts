import { CategoryChannel, Guild, VoiceChannel } from 'discord.js';
import { guildScheme } from '../../database/schemes/guildScheme';
import { Language } from '../structures/types';

export class GuildManager {
  public guild: Guild;

  constructor(guild: Guild) {
    this.guild = guild;
  }

  async getGuild() {
    let guild = await guildScheme.findOne({ serverId: this.guild.id });
    if (!guild) guild = await this.create('english');
    return guild;
  }

  async create(language: Language) {
    const guild = await guildScheme.create({
      serverId: this.guild.id,
      language,
      categoryId: null,
      channelId: null,
    });
    await guild.save().catch((err: Error) => console.log(err));
    return guild;
  }

  async delete(): Promise <void> {
    await guildScheme.deleteOne({ serverId: this.guild.id });
  }

  async getLanguage(): Promise <Language> {
    const guild = await this.getGuild();
    return guild.language;
  }

  async getTrChannels(): Promise <{trcategory: CategoryChannel | undefined, trchannel: VoiceChannel | undefined}> {
    const guild = await this.getGuild();
    const trcategory = this.guild.channels.cache.get(guild.categoryId) as CategoryChannel;
    const trchannel = this.guild.channels.cache.get(guild.channelId) as VoiceChannel;
    return { trcategory, trchannel };
  }

  async changeLanguage(language: Language): Promise <void> {
    const guild = await this.getGuild();
    await guild.updateOne({ language });
    await guild.save().catch((err: Error) => console.log(err));
  }

  async trSetup(categoryID: string | null, channelID: string | null): Promise <void> {
    const guild = await this.getGuild();
    await guild.updateOne({ categoryId: categoryID, channelId: channelID });
    await guild.save().catch((err: Error) => console.log(err));
  }
}
