import { injectable, inject } from 'tsyringe';
import {
  SlashCommandBuilder,
  EmbedBuilder
} from 'discord.js';
import { CommandBase, CommandExecuteContext } from '../../../shared/discord/CommandBase';
import { CinemaSessionService } from '../services/CinemaSessionService';
import { CinemaSessionRatingRepository } from '../repositories/CinemaSessionRatingRepository';
import { TheMovieDBService } from '../services/TheMovieDBService';

@injectable()
export class HistoryCommand extends CommandBase {
  readonly name = 'history';
  readonly description = 'View the cinema history of this server';
  readonly permissions = undefined;
  readonly guildOnly = true;

  constructor(
    @inject(CinemaSessionService) private sessionService: CinemaSessionService,
    @inject(CinemaSessionRatingRepository) private ratingRepository: CinemaSessionRatingRepository,
    @inject(TheMovieDBService) private movieService: TheMovieDBService
  ) {
    super();
  }

  buildCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .setDMPermission(false)
      .addIntegerOption(option =>
        option
          .setName('limit')
          .setDescription('Number of movies to show (default: 10)')
          .setMinValue(1)
          .setMaxValue(25)
      ) as SlashCommandBuilder;
  }

  async execute(context: CommandExecuteContext): Promise<void> {
    const { interaction } = context;
    const guild = interaction.guild!;
    const limit = interaction.options.getInteger('limit') || 10;

    await interaction.deferReply();

    try {
      const sessions = await this.sessionService.getGuildHistory(guild.id, limit);

      if (sessions.length === 0) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(0x1a1a2e)
              .setTitle('Cinema History')
              .setDescription('No movies have been watched yet in this server.')
          ]
        });
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(0xE50914)
        .setTitle(`🎬 Cinema History - ${guild.name}`)
        .setDescription(`Last ${sessions.length} movies watched`)
        .setThumbnail(guild.iconURL());

      for (const session of sessions) {
        const avgRating = await this.ratingRepository.getAverageRating(session.id);
        const ratingStars = this.getRatingStars(avgRating);
        const attendeeCount = session.attendees?.length || 0;

        const dateStr = session.scheduledStart.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });

        const fieldValue = [
          `📅 ${dateStr}`,
          `⏱️ ${this.movieService.formatRuntime(session.runtime)}`,
          `👥 ${attendeeCount} viewer${attendeeCount !== 1 ? 's' : ''}`,
          avgRating > 0 ? `${ratingStars} (${avgRating.toFixed(1)})` : 'No ratings'
        ].join(' • ');

        embed.addFields({
          name: session.title,
          value: fieldValue,
          inline: false
        });
      }

      embed.setFooter({ text: `Showing ${sessions.length} of total watched movies` });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xff4444)
            .setTitle('Error')
            .setDescription('Could not fetch cinema history.')
        ]
      });
    }
  }

  private getRatingStars(rating: number): string {
    if (rating === 0) return '☆☆☆☆☆';
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;
    return '⭐'.repeat(fullStars) + '☆'.repeat(emptyStars);
  }
}
