import { injectable, inject } from 'tsyringe';
import { Client, Interaction } from 'discord.js';
import { CommandHandler } from '../shared/discord/CommandHandler';
import { VoiceButtonHandler } from '../modules/voice/services/VoiceButtonHandler';
import { Logger } from '../core/logger';

@injectable()
export class InteractionCreateHandler {
  constructor(
    @inject(CommandHandler) private commandHandler: CommandHandler,
    @inject(VoiceButtonHandler) private voiceButtonHandler: VoiceButtonHandler,
    @inject(Logger) private logger: Logger
  ) {}

  setup(client: Client): void {
    client.on('interactionCreate', async (interaction: Interaction) => {
      await this.handleInteraction(interaction);
    });

    this.logger.info('InteractionCreateHandler registered');
  }

  private async handleInteraction(interaction: Interaction): Promise<void> {
    try {
      if (interaction.isChatInputCommand()) {
        await this.commandHandler.handleInteraction(interaction);
        return;
      }

      if (interaction.isButton()) {
        await this.voiceButtonHandler.handleButtonInteraction(interaction);
        return;
      }
    } catch (error) {
      this.logger.error('Error in interactionCreate handler', error as Error, {
        interactionId: interaction.id,
        userId: interaction.user.id
      });
    }
  }
}
