import { injectable, inject } from 'tsyringe';
import { Client, Interaction, ButtonInteraction } from 'discord.js';
import { CommandHandler } from '../shared/discord/CommandHandler';
import { VoiceButtonHandler } from '../modules/voice/services/VoiceButtonHandler';
import { DisableCommand } from '../modules/voice/commands/DisableCommand';
import { MovieCommand } from '../modules/cinema/commands/MovieCommand';
import { SessionCommand } from '../modules/cinema/commands/SessionCommand';
import { CinemaSessionService } from '../modules/cinema/services/CinemaSessionService';
import { Logger } from '../core/logger';

@injectable()
export class InteractionCreateHandler {
  constructor(
    @inject(CommandHandler) private commandHandler: CommandHandler,
    @inject(VoiceButtonHandler) private voiceButtonHandler: VoiceButtonHandler,
    @inject(DisableCommand) private disableCommand: DisableCommand,
    @inject(MovieCommand) private movieCommand: MovieCommand,
    @inject(SessionCommand) private sessionCommand: SessionCommand,
    @inject(CinemaSessionService) private cinemaSessionService: CinemaSessionService,
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
        await this.handleButton(interaction);
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

    if (commandName === 'movie' && this.movieCommand.handleAutocomplete) {
      await this.movieCommand.handleAutocomplete(interaction);
    }

    if (commandName === 'session' && this.sessionCommand.handleAutocomplete) {
      await this.sessionCommand.handleAutocomplete(interaction);
    }
  }

  private async handleButton(interaction: ButtonInteraction): Promise<void> {
    const customId = interaction.customId;

    if (customId.startsWith('cinema_rate_')) {
      await this.handleCinemaRating(interaction);
      return;
    }

    await this.voiceButtonHandler.handleButtonInteraction(interaction);
  }

  private async handleCinemaRating(interaction: ButtonInteraction): Promise<void> {
    const parts = interaction.customId.split('_');
    const sessionId = parts[2];
    const rating = parseInt(parts[3]);

    const success = await this.cinemaSessionService.rateSession(
      sessionId,
      interaction.user.id,
      rating
    );

    if (success) {
      await interaction.reply({
        content: `Thanks for rating! You gave **${'⭐'.repeat(rating)}** (${rating}/5)`,
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: 'You have already rated this movie!',
        ephemeral: true
      });
    }
  }
}
