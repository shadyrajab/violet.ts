import { injectable, inject } from 'tsyringe';
import { Client, Channel, ChannelType } from 'discord.js';
import { VoiceRoomService } from '../modules/voice/services/VoiceRoomService';
import { Logger } from '../core/logger';

@injectable()
export class ChannelDeleteHandler {
  constructor(
    @inject(VoiceRoomService) private voiceRoomService: VoiceRoomService,
    @inject(Logger) private logger: Logger
  ) {}

  setup(client: Client): void {
    client.on('channelDelete', async (channel: Channel) => {
      await this.handleChannelDelete(channel);
    });

    this.logger.info('ChannelDeleteHandler registered');
  }

  private async handleChannelDelete(channel: Channel): Promise<void> {
    try {
      if (channel.type !== ChannelType.GuildVoice) return;

      const isRoom = await this.voiceRoomService.isRoom(channel.id);

      if (isRoom) {
        await this.voiceRoomService.deleteRoom(channel.id);
        this.logger.info('Voice room deleted from database', { channelId: channel.id });
      }
    } catch (error) {
      this.logger.error('Error in channelDelete handler', error as Error, {
        channelId: channel.id
      });
    }
  }
}
