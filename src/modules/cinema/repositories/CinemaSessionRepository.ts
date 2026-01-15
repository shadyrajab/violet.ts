import { injectable, inject } from 'tsyringe';
import { Repository } from 'typeorm';
import { CinemaSession } from '../entities/CinemaSession';

@injectable()
export class CinemaSessionRepository {
  constructor(
    @inject('CinemaSessionRepository') private repository: Repository<CinemaSession>
  ) {}

  async findById(id: string): Promise<CinemaSession | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['ratings']
    });
  }

  async findByGuild(guildId: string): Promise<CinemaSession[]> {
    return this.repository.find({
      where: { guildId },
      relations: ['ratings'],
      order: { scheduledStart: 'DESC' }
    });
  }

  async findByGuildAndStatus(guildId: string, status: CinemaSession['status']): Promise<CinemaSession[]> {
    return this.repository.find({
      where: { guildId, status },
      relations: ['ratings'],
      order: { scheduledStart: 'ASC' }
    });
  }

  async findUpcoming(guildId: string): Promise<CinemaSession[]> {
    return this.repository
      .createQueryBuilder('session')
      .where('session.guild_id = :guildId', { guildId })
      .andWhere('session.status IN (:...statuses)', { statuses: ['scheduled', 'active'] })
      .andWhere('session.scheduled_start > NOW()')
      .orderBy('session.scheduled_start', 'ASC')
      .getMany();
  }

  async findFinished(guildId: string, limit = 20): Promise<CinemaSession[]> {
    return this.repository.find({
      where: { guildId, status: 'finished' },
      relations: ['ratings'],
      order: { scheduledEnd: 'DESC' },
      take: limit
    });
  }

  async findByChannelId(channelId: string): Promise<CinemaSession | null> {
    return this.repository.findOne({
      where: { channelId },
      relations: ['ratings']
    });
  }

  async findByEventId(eventId: string): Promise<CinemaSession | null> {
    return this.repository.findOne({
      where: { eventId },
      relations: ['ratings']
    });
  }

  async create(session: Partial<CinemaSession>): Promise<CinemaSession> {
    const entity = this.repository.create(session);
    return this.repository.save(entity);
  }

  async update(session: CinemaSession): Promise<CinemaSession> {
    return this.repository.save(session);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findSessionsEndingSoon(minutes = 5): Promise<CinemaSession[]> {
    const now = new Date();
    const soon = new Date(now.getTime() + minutes * 60 * 1000);

    return this.repository
      .createQueryBuilder('session')
      .where('session.status = :status', { status: 'active' })
      .andWhere('session.scheduled_end <= :soon', { soon })
      .andWhere('session.scheduled_end > :now', { now })
      .getMany();
  }

  async findSessionsToEnd(now: Date): Promise<CinemaSession[]> {
    return this.repository
      .createQueryBuilder('session')
      .where('session.status IN (:...statuses)', { statuses: ['scheduled', 'active'] })
      .andWhere('session.scheduled_end <= :now', { now })
      .getMany();
  }
}
