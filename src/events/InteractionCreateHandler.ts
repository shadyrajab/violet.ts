import { injectable, inject } from 'tsyringe';
import { Client, Interaction } from 'discord.js';
import { CommandHandler } from '../shared/discord/CommandHandler';
import { VoiceButtonHandler } from '../modules/voice/services/VoiceButtonHandler';
import { DisableCommand } from '../modules/voice/commands/DisableCommand';
import { Logger } from '../core/logger';

@injectable()
export class InteractionCreateHandler {
  constructor(
    @inject(CommandHandler) private commandHandler: CommandHandler,
    @inject(VoiceButtonHandler) private voiceButtonHandler: VoiceButtonHandler,
    @inject(DisableCommand) private disableCommand: DisableCommand,
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

      if (interaction.isAutocomplete()) {
        await this.handleAutocomplete(interaction);
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

  private async handleAutocomplete(interaction: Interaction): Promise<void> {
    if (!interaction.isAutocomplete()) return;

    const commandName = interaction.commandName;

    if (commandName === 'disable' && this.disableCommand.handleAutocomplete) {
      await this.disableCommand.handleAutocomplete(interaction);
    }
  }
}
