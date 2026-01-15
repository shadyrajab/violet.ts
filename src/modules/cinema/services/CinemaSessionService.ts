import { singleton, inject } from 'tsyringe';
import {
  Client,
  Guild,
  ChannelType,
  GuildScheduledEventEntityType,
  GuildScheduledEventPrivacyLevel
} from 'discord.js';
import { CinemaSessionRepository } from '../repositories/CinemaSessionRepository';
import { CinemaSessionRatingRepository } from '../repositories/CinemaSessionRatingRepository';
import { CinemaSession } from '../entities/CinemaSession';
import { TheMovieDBService } from './TheMovieDBService';
import { Logger } from '../../../core/logger';

@singleton()
export class CinemaSessionService {
  constructor(
    @inject(CinemaSessionRepository) private sessionRepository: CinemaSessionRepository,
    @inject(CinemaSessionRatingRepository) private ratingRepository: CinemaSessionRatingRepository,
    @inject(TheMovieDBService) private movieService: TheMovieDBService,
    @inject(Client) private client: Client,
    @inject(Logger) private logger: Logger
  ) {}

  async createSession(
    guild: Guild,
    tmdbId: number,
    categoryId: string,
    hostedBy: string,
    scheduledStart: Date
  ): Promise<CinemaSession> {
    const movie = await this.movieService.getMovieDetails(tmdbId);
    const posterUrl = this.movieService.getPosterUrl(movie.posterPath, 'original');

    const scheduledEnd = new Date(scheduledStart.getTime() + movie.runtime * 60 * 1000);

    const voiceChannel = await guild.channels.create({
      name: `🎬 ${movie.title}`,
      type: ChannelType.GuildVoice,
      parent: categoryId
    });

    const event = await guild.scheduledEvents.create({
      name: movie.title,
      description: movie.overview || 'Cinema session',
      privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
      scheduledStartTime: scheduledStart,
      scheduledEndTime: scheduledEnd,
      entityType: GuildScheduledEventEntityType.Voice,
      channel: voiceChannel.id,
      image: posterUrl,
      reason: `Cinema session hosted by ${hostedBy}`
    });

    const session = await this.sessionRepository.create({
      guildId: guild.id,
      tmdbId: movie.id,
      title: movie.title,
      posterPath: movie.posterPath,
      runtime: movie.runtime,
      channelId: voiceChannel.id,
      eventId: event.id,
      hostedBy,
      scheduledStart,
      scheduledEnd,
      status: 'scheduled',
      attendees: []
    });

    this.logger.info('Cinema session created', {
      sessionId: session.id,
      guildId: guild.id,
      title: movie.title,
      scheduledStart: scheduledStart.toISOString()
    });

    return session;
  }

  async rateSession(sessionId: string, userId: string, rating: number): Promise<boolean> {
    const existing = await this.ratingRepository.findBySessionAndUser(sessionId, userId);
    if (existing) {
      return false;
    }

    await this.ratingRepository.create({
      sessionId,
      userId,
      rating
    });

    return true;
  }

  async addAttendee(sessionId: string, userId: string): Promise<void> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) return;

    session.addAttendee(userId);
    await this.sessionRepository.update(session);
  }

  async removeAttendee(sessionId: string, userId: string): Promise<void> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) return;

    session.removeAttendee(userId);
    await this.sessionRepository.update(session);
  }

  async getSessionByEvent(eventId: string): Promise<CinemaSession | null> {
    return this.sessionRepository.findByEventId(eventId);
  }

  async getGuildHistory(guildId: string, limit = 20): Promise<CinemaSession[]> {
    return this.sessionRepository.findFinished(guildId, limit);
  }

  async getUpcomingSessions(guildId: string): Promise<CinemaSession[]> {
    return this.sessionRepository.findUpcoming(guildId);
  }

  async cancelSession(sessionId: string): Promise<void> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) return;

    session.status = 'cancelled';
    await this.sessionRepository.update(session);

    const guild = await this.client.guilds.fetch(session.guildId).catch(() => null);
    if (guild) {
      const channel = await guild.channels.fetch(session.channelId).catch(() => null);
      if (channel) {
        await channel.delete('Session cancelled').catch(() => {});
      }

      if (session.eventId) {
        const event = await guild.scheduledEvents.fetch(session.eventId).catch(() => null);
        if (event) {
          await event.delete().catch(() => {});
        }
      }
    }

    this.logger.info('Cinema session cancelled', { sessionId, title: session.title });
  }
}
