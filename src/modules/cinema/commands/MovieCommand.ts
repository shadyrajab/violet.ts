import { injectable, inject } from 'tsyringe';
import {
  SlashCommandBuilder,
  EmbedBuilder,
  AutocompleteInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';
import { CommandBase, CommandExecuteContext } from '../../../shared/discord/CommandBase';
import { TheMovieDBService } from '../services/TheMovieDBService';

@injectable()
export class MovieCommand extends CommandBase {
  readonly name = 'movie';
  readonly description = 'Search for a movie and get detailed information';
  readonly permissions = undefined;
  readonly guildOnly = false;

  constructor(
    @inject(TheMovieDBService) private movieService: TheMovieDBService
  ) {
    super();
  }

  buildCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(option =>
        option
          .setName('title')
          .setDescription('Movie title to search')
          .setRequired(true)
          .setAutocomplete(true)
      ) as SlashCommandBuilder;
  }

  async handleAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
    const focusedValue = interaction.options.getFocused();

    if (focusedValue.length < 2) {
      await interaction.respond([]);
      return;
    }

    try {
      const results = await this.movieService.searchMovie(focusedValue);

      const options = results.results
        .slice(0, 25)
        .map(movie => {
          const year = movie.releaseDate ? ` (${movie.releaseDate.split('-')[0]})` : '';
          const name = `${movie.title}${year}`.slice(0, 100);
          return {
            name,
            value: movie.id.toString()
          };
        });

      await interaction.respond(options);
    } catch {
      await interaction.respond([]);
    }
  }

  async execute(context: CommandExecuteContext): Promise<void> {
    const { interaction } = context;

    await interaction.deferReply();

    const movieId = parseInt(interaction.options.getString('title', true));

    try {
      const [movie, providers] = await Promise.all([
        this.movieService.getMovieDetails(movieId),
        this.movieService.getMovieProviders(movieId)
      ]);

      const posterUrl = this.movieService.getPosterUrl(movie.posterPath);
      const backdropUrl = this.movieService.getBackdropUrl(movie.backdropPath);

      const ratingStars = this.getRatingStars(movie.voteAverage);
      const genres = movie.genres.map(g => g.name).join(' • ') || 'N/A';

      const brProviders = providers.results?.['BR'];
      let streamingText = '';

      if (brProviders?.flatrate?.length) {
        streamingText = brProviders.flatrate
          .slice(0, 5)
          .map(p => p.providerName)
          .join(', ');
      }

      const embed = new EmbedBuilder()
        .setColor(0x1a1a2e)
        .setTitle(movie.title)
        .setURL(`https://www.themoviedb.org/movie/${movie.id}`)
        .setDescription(movie.overview || '*No description available.*')
        .setThumbnail(posterUrl)
        .addFields(
          {
            name: '⭐ Rating',
            value: `${ratingStars}\n**${movie.voteAverage.toFixed(1)}**/10 (${movie.voteCount.toLocaleString()} votes)`,
            inline: true
          },
          {
            name: '📅 Release Date',
            value: this.movieService.formatDate(movie.releaseDate),
            inline: true
          },
          {
            name: '⏱️ Runtime',
            value: movie.runtime ? this.movieService.formatRuntime(movie.runtime) : 'N/A',
            inline: true
          },
          {
            name: '🎭 Genres',
            value: genres,
            inline: false
          }
        );

      if (movie.tagline) {
        embed.addFields({
          name: '💬 Tagline',
          value: `*"${movie.tagline}"*`,
          inline: false
        });
      }

      if (movie.budget > 0 || movie.revenue > 0) {
        embed.addFields(
          {
            name: '💰 Budget',
            value: this.movieService.formatCurrency(movie.budget),
            inline: true
          },
          {
            name: '💵 Revenue',
            value: this.movieService.formatCurrency(movie.revenue),
            inline: true
          },
          {
            name: '📈 Profit',
            value: movie.revenue > 0 && movie.budget > 0
              ? this.movieService.formatCurrency(movie.revenue - movie.budget)
              : 'N/A',
            inline: true
          }
        );
      }

      if (streamingText) {
        embed.addFields({
          name: '📺 Streaming (BR)',
          value: streamingText,
          inline: false
        });
      }

      if (movie.productionCompanies.length > 0) {
        const studios = movie.productionCompanies
          .slice(0, 3)
          .map(c => c.name)
          .join(' • ');
        embed.addFields({
          name: '🎬 Studios',
          value: studios,
          inline: false
        });
      }

      if (backdropUrl) {
        embed.setImage(backdropUrl);
      }

      embed.setFooter({
        text: `Status: ${this.translateStatus(movie.status)} • Data from TheMovieDB`,
        iconURL: 'https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_1-5bdc75aaebeb75dc7ae79426ddd9be3b2be1e342510f8202baf6bffa71d7f5c4.svg'
      });

      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setLabel('TMDB')
            .setStyle(ButtonStyle.Link)
            .setURL(`https://www.themoviedb.org/movie/${movie.id}`)
            .setEmoji('🎬'),
          new ButtonBuilder()
            .setLabel('IMDB')
            .setStyle(ButtonStyle.Link)
            .setURL(`https://www.imdb.com/title/${movie.imdbId}`)
            .setEmoji('⭐')
            .setDisabled(!movie.imdbId)
        );

      if (brProviders?.link) {
        row.addComponents(
          new ButtonBuilder()
            .setLabel('Where to Watch')
            .setStyle(ButtonStyle.Link)
            .setURL(brProviders.link)
            .setEmoji('📺')
        );
      }

      await interaction.editReply({ embeds: [embed], components: [row] });
    } catch (error) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xff4444)
            .setTitle('Error')
            .setDescription('Could not fetch movie information. Please try again.')
        ]
      });
    }
  }

  private getRatingStars(rating: number): string {
    const fullStars = Math.floor(rating / 2);
    const halfStar = rating % 2 >= 1 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
  }

  private translateStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'Released': 'Released',
      'Post Production': 'Post Production',
      'In Production': 'In Production',
      'Planned': 'Planned',
      'Canceled': 'Canceled',
      'Rumored': 'Rumored'
    };
    return statusMap[status] || status;
  }
}
