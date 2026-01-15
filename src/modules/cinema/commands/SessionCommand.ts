import { injectable, inject } from 'tsyringe';
import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  AutocompleteInteraction,
  EmbedBuilder
} from 'discord.js';
import { CommandBase, CommandExecuteContext, CommandPermission } from '../../../shared/discord/CommandBase';
import { CinemaSessionService } from '../services/CinemaSessionService';
import { TheMovieDBService } from '../services/TheMovieDBService';
import { VoiceProfileService } from '../../voice/services/VoiceProfileService';

@injectable()
export class SessionCommand extends CommandBase {
  readonly name = 'session';
  readonly description = 'Create a cinema session event for watching a movie';
  readonly permissions: CommandPermission[] = ['ManageEvents'];
  readonly guildOnly = true;

  constructor(
    @inject(CinemaSessionService) private sessionService: CinemaSessionService,
    @inject(TheMovieDBService) private movieService: TheMovieDBService,
    @inject(VoiceProfileService) private profileService: VoiceProfileService
  ) {
    super();
  }

  buildCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .setDMPermission(false)
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
      .addStringOption(option =>
        option
          .setName('movie')
          .setDescription('Movie to watch')
          .setRequired(true)
          .setAutocomplete(true)
      )
      .addStringOption(option =>
        option
          .setName('date')
          .setDescription('Date of the session (YYYY-MM-DD)')
          .setRequired(true)
          .setAutocomplete(true)
      )
      .addStringOption(option =>
        option
          .setName('time')
          .setDescription('Time of the session (HH:MM)')
          .setRequired(true)
          .setAutocomplete(true)
      ) as SlashCommandBuilder;
  }

  async handleAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
    const focusedOption = interaction.options.getFocused(true);

    if (focusedOption.name === 'movie') {
      await this.handleMovieAutocomplete(interaction, focusedOption.value);
    } else if (focusedOption.name === 'date') {
      await this.handleDateAutocomplete(interaction, focusedOption.value);
    } else if (focusedOption.name === 'time') {
      await this.handleTimeAutocomplete(interaction, focusedOption.value);
    }
  }

  private async handleMovieAutocomplete(interaction: AutocompleteInteraction, value: string): Promise<void> {
    if (value.length < 2) {
      await interaction.respond([]);
      return;
    }

    try {
      const results = await this.movieService.searchMovie(value);
      const options = results.results
        .slice(0, 25)
        .map(movie => {
          const year = movie.releaseDate ? ` (${movie.releaseDate.split('-')[0]})` : '';
          const name = `${movie.title}${year}`.slice(0, 100);
          return { name, value: movie.id.toString() };
        });

      await interaction.respond(options);
    } catch {
      await interaction.respond([]);
    }
  }

  private async handleDateAutocomplete(interaction: AutocompleteInteraction, value: string): Promise<void> {
    const choices = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const formattedDate = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const displayName = `${formattedDate} (${dayName})`;

      choices.push({ name: displayName, value: formattedDate });
    }

    const filtered = choices
      .filter(c => c.name.toLowerCase().includes(value.toLowerCase()))
      .slice(0, 25);

    await interaction.respond(filtered);
  }

  private async handleTimeAutocomplete(interaction: AutocompleteInteraction, value: string): Promise<void> {
    const choices = [];
    const intervals = ['00', '15', '30', '45'];

    for (let hour = 0; hour < 24; hour++) {
      const formattedHour = hour.toString().padStart(2, '0');

      for (const minute of intervals) {
        const time = `${formattedHour}:${minute}`;
        choices.push({ name: time, value: time });
      }
    }

    const filtered = choices
      .filter(c => c.name.includes(value))
      .slice(0, 25);

    await interaction.respond(filtered);
  }

  async execute(context: CommandExecuteContext): Promise<void> {
    const { interaction } = context;
    const guild = interaction.guild!;

    await interaction.deferReply({ ephemeral: true });

    try {
      const cinemaProfile = await this.profileService.getCinemaProfile(guild.id);

      if (!cinemaProfile) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(0xff4444)
              .setTitle('No Cinema Profile')
              .setDescription('This server does not have a cinema profile.\n\nUse `/setup` with type "Cinema Sessions" first.')
          ]
        });
        return;
      }

      const movieId = parseInt(interaction.options.getString('movie', true));
      const date = interaction.options.getString('date', true);
      const time = interaction.options.getString('time', true);

      const [year, month, day] = date.split('-').map(Number);
      const [hour, minute] = time.split(':').map(Number);

      const scheduledStart = new Date(year, month - 1, day, hour, minute);

      if (scheduledStart <= new Date()) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(0xff4444)
              .setTitle('Invalid Date')
              .setDescription('The scheduled date must be in the future.')
          ]
        });
        return;
      }

      const session = await this.sessionService.createSession(
        guild,
        movieId,
        cinemaProfile.categoryId,
        interaction.user.id,
        scheduledStart
      );

      const movie = await this.movieService.getMovieDetails(movieId);

      const embed = new EmbedBuilder()
        .setColor(0xE50914)
        .setTitle('Cinema Session Created')
        .setDescription(`**${movie.title}** has been scheduled!`)
        .setThumbnail(this.movieService.getPosterUrl(movie.posterPath, 'w185'))
        .addFields(
          { name: 'Date', value: scheduledStart.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }), inline: true },
          { name: 'Time', value: scheduledStart.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          }), inline: true },
          { name: 'Duration', value: this.movieService.formatRuntime(movie.runtime), inline: true },
          { name: 'Channel', value: `<#${session.channelId}>`, inline: false }
        )
        .setFooter({ text: 'Users who mark "Interested" on the event will be added to the channel' });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xff4444)
            .setTitle('Error')
            .setDescription((error as Error).message)
        ]
      });
    }
  }
}
