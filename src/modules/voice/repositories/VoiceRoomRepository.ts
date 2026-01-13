import { singleton, inject } from 'tsyringe';
import { Repository } from 'typeorm';
import { VoiceRoom } from '../entities/VoiceRoom';

@singleton()
export class VoiceRoomRepository {
  constructor(
    @inject('VoiceRoomRepository') private repository: Repository<VoiceRoom>
  ) {}

  async findByChannelId(channelId: string): Promise<VoiceRoom | null> {
    return await this.repository.findOne({
      where: { channelId }
    });
  }

  async findByOwnerId(ownerId: string): Promise<VoiceRoom[]> {
    return await this.repository.find({
      where: { ownerId }
    });
  }

  async countByOwnerId(ownerId: string): Promise<number> {
    return await this.repository.count({
      where: { ownerId }
    });
  }

  async create(channelId: string, ownerId: string, adminIds: string[] = []): Promise<VoiceRoom> {
    const voiceRoom = new VoiceRoom();
    voiceRoom.channelId = channelId;
    voiceRoom.ownerId = ownerId;
    voiceRoom.adminIds = adminIds;

    return await this.repository.save(voiceRoom);
  }

  async updateAdmins(channelId: string, adminIds: string[]): Promise<VoiceRoom | null> {
    const voiceRoom = await this.findByChannelId(channelId);
    if (!voiceRoom) {
      return null;
    }

    voiceRoom.adminIds = adminIds;
    return await this.repository.save(voiceRoom);
  }

  async delete(channelId: string): Promise<boolean> {
    const result = await this.repository.delete({ channelId });
    return (result.affected ?? 0) > 0;
  }

  async deleteByOwnerId(ownerId: string): Promise<number> {
    const result = await this.repository.delete({ ownerId });
    return result.affected ?? 0;
  }
}
