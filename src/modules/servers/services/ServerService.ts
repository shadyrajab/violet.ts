import { singleton, inject } from 'tsyringe';
import { ServerRepository } from '../repositories/ServerRepository';
import { Server } from '../entities/Server';
import { Language } from '../../../core/types';
import { Logger } from '../../../core/logger';
import { NotFoundError } from '../../../core/errors';

@singleton()
export class ServerService {
  constructor(
    @inject(ServerRepository) private serverRepository: ServerRepository,
    @inject(Logger) private logger: Logger
  ) {}

  async getServerLanguage(serverId: string): Promise<Language> {
    try {
      const server = await this.serverRepository.findById(serverId);
      return server?.language ?? 'english';
    } catch (error) {
      this.logger.error('Failed to get server language', error as Error, { serverId });
      return 'english';
    }
  }

  async setServerLanguage(serverId: string, language: Language): Promise<Server> {
    try {
      const server = await this.serverRepository.findOrCreate(serverId, language);

      if (server.language !== language) {
        const updated = await this.serverRepository.update(serverId, { language });
        this.logger.info('Server language updated', { serverId, language });
        return updated!;
      }

      return server;
    } catch (error) {
      this.logger.error('Failed to set server language', error as Error, { serverId, language });
      throw error;
    }
  }

  async getOrCreateServer(serverId: string, defaultLanguage: Language = 'english'): Promise<Server> {
    try {
      return await this.serverRepository.findOrCreate(serverId, defaultLanguage);
    } catch (error) {
      this.logger.error('Failed to get or create server', error as Error, { serverId });
      throw error;
    }
  }

  async setupTemporaryChannels(serverId: string, categoryId: string, channelId: string): Promise<Server> {
    try {
      await this.serverRepository.findOrCreate(serverId);

      const updated = await this.serverRepository.setupTemporaryChannels(serverId, categoryId, channelId);

      if (!updated) {
        throw new NotFoundError('Server');
      }

      this.logger.info('Temporary channels setup configured', { serverId, categoryId, channelId });
      return updated;
    } catch (error) {
      this.logger.error('Failed to setup temporary channels', error as Error, { serverId, categoryId, channelId });
      throw error;
    }
  }

  async disableTemporaryChannels(serverId: string): Promise<Server> {
    try {
      const updated = await this.serverRepository.disableTemporaryChannels(serverId);

      if (!updated) {
        throw new NotFoundError('Server');
      }

      this.logger.info('Temporary channels disabled', { serverId });
      return updated;
    } catch (error) {
      this.logger.error('Failed to disable temporary channels', error as Error, { serverId });
      throw error;
    }
  }

  async getServerConfig(serverId: string): Promise<Server | null> {
    try {
      return await this.serverRepository.findById(serverId);
    } catch (error) {
      this.logger.error('Failed to get server config', error as Error, { serverId });
      throw error;
    }
  }
}
