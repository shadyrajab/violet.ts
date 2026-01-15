import { singleton, inject } from 'tsyringe';
import { Repository } from 'typeorm';
import { Server } from '../entities/Server';
import { Locale, DEFAULT_LOCALE } from '../../../core/i18n';

@singleton()
export class ServerRepository {
  constructor(
    @inject('ServerRepository') private repository: Repository<Server>
  ) {}

  async findById(serverId: string): Promise<Server | null> {
    return await this.repository.findOne({
      where: { serverId }
    });
  }

  async create(serverId: string, language: Locale = DEFAULT_LOCALE): Promise<Server> {
    const server = new Server();
    server.serverId = serverId;
    server.language = language;
    server.categoryId = null;
    server.channelId = null;

    return await this.repository.save(server);
  }

  async update(serverId: string, updates: Partial<Omit<Server, 'serverId' | 'createdAt' | 'updatedAt'>>): Promise<Server | null> {
    const server = await this.findById(serverId);
    if (!server) {
      return null;
    }

    if (updates.language !== undefined) {
      server.language = updates.language;
    }

    if (updates.categoryId !== undefined) {
      server.categoryId = updates.categoryId;
    }

    if (updates.channelId !== undefined) {
      server.channelId = updates.channelId;
    }

    return await this.repository.save(server);
  }

  async findOrCreate(serverId: string, defaultLanguage: Locale = DEFAULT_LOCALE): Promise<Server> {
    const existing = await this.findById(serverId);
    if (existing) {
      return existing;
    }
    return await this.create(serverId, defaultLanguage);
  }

  async delete(serverId: string): Promise<boolean> {
    const result = await this.repository.delete({ serverId });
    return (result.affected ?? 0) > 0;
  }

  async setupTemporaryChannels(serverId: string, categoryId: string, channelId: string): Promise<Server | null> {
    return await this.update(serverId, { categoryId, channelId });
  }

  async disableTemporaryChannels(serverId: string): Promise<Server | null> {
    return await this.update(serverId, { categoryId: null, channelId: null });
  }
}
