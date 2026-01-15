import { injectable, inject } from 'tsyringe';
import { Repository } from 'typeorm';
import { VoiceProfile, ProfileType } from '../entities/VoiceProfile';

@injectable()
export class VoiceProfileRepository {
  constructor(
    @inject('VoiceProfileRepository') private repository: Repository<VoiceProfile>
  ) {}

  async findById(id: string): Promise<VoiceProfile | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByGuildAndName(guildId: string, name: string): Promise<VoiceProfile | null> {
    return this.repository.findOne({ where: { guildId, name } });
  }

  async findByGuild(guildId: string): Promise<VoiceProfile[]> {
    return this.repository.find({ where: { guildId }, order: { createdAt: 'DESC' } });
  }

  async findByOwner(ownerId: string, guildId: string): Promise<VoiceProfile[]> {
    return this.repository.find({ where: { ownerId, guildId }, order: { createdAt: 'DESC' } });
  }

  async countByOwner(ownerId: string, guildId: string): Promise<number> {
    return this.repository.count({ where: { ownerId, guildId } });
  }

  async countByGuild(guildId: string): Promise<number> {
    return this.repository.count({ where: { guildId } });
  }

  async create(profile: VoiceProfile): Promise<VoiceProfile> {
    return this.repository.save(profile);
  }

  async update(profile: VoiceProfile): Promise<VoiceProfile> {
    return this.repository.save(profile);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findActiveByJoinChannel(joinChannelId: string): Promise<VoiceProfile | null> {
    return this.repository.findOne({ where: { joinChannelId, isActive: true } });
  }

  async findByGuildAndType(guildId: string, profileType: ProfileType): Promise<VoiceProfile[]> {
    return this.repository.find({
      where: { guildId, profileType, isActive: true },
      order: { createdAt: 'DESC' }
    });
  }

  async findCinemaProfile(guildId: string): Promise<VoiceProfile | null> {
    return this.repository.findOne({
      where: { guildId, profileType: 'cinema', isActive: true }
    });
  }
}
