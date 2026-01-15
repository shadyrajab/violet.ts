import { injectable, inject } from 'tsyringe';
import { Client, GuildScheduledEventStatus } from 'discord.js';
import { CinemaSessionService } from '../modules/cinema/services/CinemaSessionService';
import { CinemaSessionRepository } from '../modules/cinema/repositories/CinemaSessionRepository';
import { Logger } from '../core/logger';

@injectable()
export class GuildScheduledEventHandler {
  constructor(
    @inject(CinemaSessionService) private sessionService: CinemaSessionService,
    @inject(CinemaSessionRepository) private sessionRepository: CinemaSessionRepository,
    @inject(Logger) private logger: Logger
  ) {}

  setup(client: Client): void {
    client.on('guildScheduledEventUserAdd', async (event, user) => {
      try {
        const session = await this.sessionRepository.findByEventId(event.id);
        if (!session) return;

        await this.sessionService.addAttendee(session.id, user.id);

        const guild = event.guild;
        if (!guild) return;

        const channel = await guild.channels.fetch(session.channelId).catch(() => null);
        if (!channel || !channel.isVoiceBased()) return;

        const member = await guild.members.fetch(user.id).catch(() => null);
        if (!member) return;

        await channel.permissionOverwrites.create(member, {
          ViewChannel: true,
          Connect: true
        });

        this.logger.info('User interested in cinema event', {
          sessionId: session.id,
          userId: user.id,
          eventId: event.id
        });
      } catch (error) {
        this.logger.error('Error handling event user add', error as Error);
      }
    });

    client.on('guildScheduledEventUserRemove', async (event, user) => {
      try {
        const session = await this.sessionRepository.findByEventId(event.id);
        if (!session) return;

        await this.sessionService.removeAttendee(session.id, user.id);

        const guild = event.guild;
        if (!guild) return;

        const channel = await guild.channels.fetch(session.channelId).catch(() => null);
        if (!channel || !channel.isVoiceBased()) return;

        const member = await guild.members.fetch(user.id).catch(() => null);
        if (!member) return;

        await channel.permissionOverwrites.delete(member).catch(() => {});

        this.logger.info('User removed interest in cinema event', {
          sessionId: session.id,
          userId: user.id,
          eventId: event.id
        });
      } catch (error) {
        this.logger.error('Error handling event user remove', error as Error);
      }
    });

    client.on('guildScheduledEventUpdate', async (_oldEvent, newEvent) => {
      try {
        if (!newEvent) return;

        const session = await this.sessionRepository.findByEventId(newEvent.id);
        if (!session) return;

        if (newEvent.status === GuildScheduledEventStatus.Active && session.status === 'scheduled') {
          session.status = 'active';
          await this.sessionRepository.update(session);
          this.logger.info('Cinema session started', { sessionId: session.id });
        }

        if (newEvent.status === GuildScheduledEventStatus.Completed ||
            newEvent.status === GuildScheduledEventStatus.Canceled) {
          if (newEvent.status === GuildScheduledEventStatus.Canceled) {
            await this.sessionService.cancelSession(session.id);
          }
        }
      } catch (error) {
        this.logger.error('Error handling event update', error as Error);
      }
    });

    this.logger.info('GuildScheduledEventHandler registered');
  }
}
