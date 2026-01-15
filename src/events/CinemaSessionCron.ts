import { injectable, inject } from 'tsyringe';
import { Client, ChannelType, VoiceChannel, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import cron from 'node-cron';
import { CinemaSessionRepository } from '../modules/cinema/repositories/CinemaSessionRepository';
import { TheMovieDBService } from '../modules/cinema/services/TheMovieDBService';
import { Logger } from '../core/logger';

@injectable()
export class CinemaSessionCron {
  private client!: Client;

  constructor(
    @inject(CinemaSessionRepository) private sessionRepository: CinemaSessionRepository,
    @inject(TheMovieDBService) private movieService: TheMovieDBService,
    @inject(Logger) private logger: Logger
  ) {}

  setup(client: Client): void {
    this.client = client;

    client.once('ready', () => {
      this.startCron();
    });

    this.logger.info('CinemaSessionCron registered');
  }

  private startCron(): void {
    cron.schedule('* * * * *', async () => {
      try {
        await this.processEndedSessions();
      } catch (error) {
        this.logger.error('Error processing ended cinema sessions', error as Error);
      }
    });

    this.logger.info('Cinema session cron started (every 1 minute)');
  }

  private async processEndedSessions(): Promise<void> {
    const now = new Date();
    const sessions = await this.sessionRepository.findSessionsToEnd(now);

    for (const session of sessions) {
      try {
        session.status = 'finished';
        await this.sessionRepository.update(session);

        const guild = await this.client.guilds.fetch(session.guildId).catch(() => null);
        if (!guild) continue;

        const channel = await guild.channels.fetch(session.channelId).catch(() => null);
        if (channel && channel.type === ChannelType.GuildVoice) {
          const voiceChannel = channel as VoiceChannel;
          const attendees = Array.from(voiceChannel.members.keys());

          session.attendees = attendees;
          await this.sessionRepository.update(session);

          await this.sendRatingEmbed(voiceChannel, session);
        }

        this.logger.info('Cinema session ended by cron', {
          sessionId: session.id,
          title: session.title,
          attendeesCount: session.attendees.length
        });
      } catch (error) {
        this.logger.error('Error ending cinema session', error as Error, { sessionId: session.id });
      }
    }
  }

  private async sendRatingEmbed(channel: VoiceChannel, session: { id: string; title: string; posterPath: string | null; runtime: number }): Promise<void> {
    const embed = new EmbedBuilder()
      .setColor(0xE50914)
      .setTitle(`🎬 ${session.title}`)
      .setDescription('The movie has ended! Rate your experience.')
      .setThumbnail(this.movieService.getPosterUrl(session.posterPath, 'w185'))
      .addFields({
        name: 'Duration',
        value: this.movieService.formatRuntime(session.runtime),
        inline: true
      })
      .setFooter({ text: 'Click a button to rate this movie' });

    const buttons = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`cinema_rate_${session.id}_1`)
          .setLabel('1')
          .setEmoji('⭐')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`cinema_rate_${session.id}_2`)
          .setLabel('2')
          .setEmoji('⭐')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`cinema_rate_${session.id}_3`)
          .setLabel('3')
          .setEmoji('⭐')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`cinema_rate_${session.id}_4`)
          .setLabel('4')
          .setEmoji('⭐')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`cinema_rate_${session.id}_5`)
          .setLabel('5')
          .setEmoji('⭐')
          .setStyle(ButtonStyle.Secondary)
      );

    await channel.send({ embeds: [embed], components: [buttons] });
  }
}
