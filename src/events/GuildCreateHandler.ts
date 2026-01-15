import { injectable, inject } from 'tsyringe';
import { Client, Guild } from 'discord.js';
import { ServerService } from '../modules/servers/services/ServerService';
import { Logger } from '../core/logger';

@injectable()
export class GuildCreateHandler {
  constructor(
    @inject(ServerService) private serverService: ServerService,
    @inject(Logger) private logger: Logger
  ) {}

  setup(client: Client): void {
    client.on('guildCreate', async (guild: Guild) => {
      await this.handleGuildCreate(guild);
    });

    this.logger.info('GuildCreateHandler registered');
  }

  private async handleGuildCreate(guild: Guild): Promise<void> {
    try {
      await this.serverService.getOrCreateServer(guild.id);
      this.logger.info('Server registered on bot join', { guildId: guild.id, guildName: guild.name });
    } catch (error) {
      this.logger.error('Failed to register server on join', error as Error, { guildId: guild.id });
    }
  }
}
