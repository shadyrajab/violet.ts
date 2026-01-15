import { singleton, inject } from 'tsyringe';
import { VoiceRoomRepository } from '../repositories/VoiceRoomRepository';
import { VoiceRoom } from '../entities/VoiceRoom';
import { Logger } from '../../../core/logger';
import { NotFoundError, ValidationError } from '../../../core/errors';
import { Observability } from '../../../core/observability';

@singleton()
export class VoiceRoomService {
  private readonly MAX_ROOMS_PER_USER = 2;

  constructor(
    @inject(VoiceRoomRepository) private voiceRoomRepository: VoiceRoomRepository,
    @inject(Logger) private logger: Logger
  ) {}

  async getRoom(channelId: string): Promise<VoiceRoom | null> {
    return await Observability.executeWithSpan(
      'voice_room.get',
      async () => {
        try {
          return await this.voiceRoomRepository.findByChannelId(channelId);
        } catch (error) {
          this.logger.error('Failed to get voice room', error as Error, { channelId });
          throw error;
        }
      },
      'db',
      'voice_room',
      'query'
    );
  }

  async isRoom(channelId: string): Promise<boolean> {
    try {
      const room = await this.voiceRoomRepository.findByChannelId(channelId);
      return room !== null;
    } catch (error) {
      this.logger.error('Failed to check if channel is room', error as Error, { channelId });
      return false;
    }
  }

  async canUserCreateRoom(userId: string): Promise<boolean> {
    try {
      const count = await this.voiceRoomRepository.countByOwnerId(userId);
      return count < this.MAX_ROOMS_PER_USER;
    } catch (error) {
      this.logger.error('Failed to check user room limit', error as Error, { userId });
      return false;
    }
  }

  async createRoom(channelId: string, ownerId: string, adminIds: string[] = []): Promise<VoiceRoom> {
    return await Observability.executeWithSpan(
      'voice_room.create',
      async () => {
        try {
          const canCreate = await this.canUserCreateRoom(ownerId);

          if (!canCreate) {
            throw new ValidationError(`User has reached maximum room limit (${this.MAX_ROOMS_PER_USER})`);
          }

          const room = await this.voiceRoomRepository.create(channelId, ownerId, adminIds);

          this.logger.info('Voice room created', { channelId, ownerId });
          return room;
        } catch (error) {
          this.logger.error('Failed to create voice room', error as Error, { channelId, ownerId });
          Observability.captureError(error as Error, { channelId, ownerId });
          throw error;
        }
      },
      'db',
      'voice_room',
      'insert'
    );
  }

  async deleteRoom(channelId: string): Promise<void> {
    return await Observability.executeWithSpan(
      'voice_room.delete',
      async () => {
        try {
          const deleted = await this.voiceRoomRepository.delete(channelId);

          if (deleted) {
            this.logger.info('Voice room deleted', { channelId });
          }
        } catch (error) {
          this.logger.error('Failed to delete voice room', error as Error, { channelId });
          throw error;
        }
      },
      'db',
      'voice_room',
      'delete'
    );
  }

  async addAdmin(channelId: string, userId: string): Promise<VoiceRoom> {
    return await Observability.executeWithSpan(
      'voice_room.add_admin',
      async () => {
        try {
          const room = await this.voiceRoomRepository.findByChannelId(channelId);

          if (!room) {
            throw new NotFoundError('Voice room');
          }

          room.addAdmin(userId);

          const updated = await this.voiceRoomRepository.updateAdmins(channelId, room.adminIds);

          if (!updated) {
            throw new NotFoundError('Voice room');
          }

          this.logger.info('Admin added to voice room', { channelId, userId });
          return updated;
        } catch (error) {
          this.logger.error('Failed to add admin to voice room', error as Error, { channelId, userId });
          throw error;
        }
      },
      'db',
      'voice_room',
      'update'
    );
  }

  async removeAdmin(channelId: string, userId: string): Promise<VoiceRoom> {
    return await Observability.executeWithSpan(
      'voice_room.remove_admin',
      async () => {
        try {
          const room = await this.voiceRoomRepository.findByChannelId(channelId);

          if (!room) {
            throw new NotFoundError('Voice room');
          }

          room.removeAdmin(userId);

          const updated = await this.voiceRoomRepository.updateAdmins(channelId, room.adminIds);

          if (!updated) {
            throw new NotFoundError('Voice room');
          }

          this.logger.info('Admin removed from voice room', { channelId, userId });
          return updated;
        } catch (error) {
          this.logger.error('Failed to remove admin from voice room', error as Error, { channelId, userId });
          throw error;
        }
      },
      'db',
      'voice_room',
      'update'
    );
  }

  async isOwner(channelId: string, userId: string): Promise<boolean> {
    try {
      const room = await this.voiceRoomRepository.findByChannelId(channelId);
      return room?.isOwner(userId) ?? false;
    } catch (error) {
      this.logger.error('Failed to check room owner', error as Error, { channelId, userId });
      return false;
    }
  }

  async isAdmin(channelId: string, userId: string): Promise<boolean> {
    try {
      const room = await this.voiceRoomRepository.findByChannelId(channelId);
      return room?.isAdmin(userId) ?? false;
    } catch (error) {
      this.logger.error('Failed to check room admin', error as Error, { channelId, userId });
      return false;
    }
  }

  async hasPermission(channelId: string, userId: string): Promise<boolean> {
    try {
      const room = await this.voiceRoomRepository.findByChannelId(channelId);
      return room?.hasPermission(userId) ?? false;
    } catch (error) {
      this.logger.error('Failed to check room permission', error as Error, { channelId, userId });
      return false;
    }
  }

  async getUserRooms(userId: string): Promise<VoiceRoom[]> {
    try {
      return await this.voiceRoomRepository.findByOwnerId(userId);
    } catch (error) {
      this.logger.error('Failed to get user rooms', error as Error, { userId });
      throw error;
    }
  }
}
