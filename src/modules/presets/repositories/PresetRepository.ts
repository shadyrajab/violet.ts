import { singleton, inject } from 'tsyringe';
import { Repository } from 'typeorm';
import { Preset } from '../entities/Preset';

@singleton()
export class PresetRepository {
  constructor(
    @inject('PresetRepository') private repository: Repository<Preset>
  ) {}

  async findByUserAndGuild(userId: string, guildId: string): Promise<Preset | null> {
    return await this.repository.findOne({
      where: { userId, guildId }
    });
  }

  async findByUser(userId: string): Promise<Preset[]> {
    return await this.repository.find({
      where: { userId }
    });
  }

  async create(preset: Preset): Promise<Preset> {
    return await this.repository.save(preset);
  }

  async update(userId: string, guildId: string, preset: Preset): Promise<Preset | null> {
    const existing = await this.findByUserAndGuild(userId, guildId);
    if (!existing) {
      return null;
    }

    existing.name = preset.name;
    existing.hide = preset.hide;
    existing.lock = preset.lock;
    existing.memberIds = preset.memberIds;
    existing.adminIds = preset.adminIds;
    existing.blockedIds = preset.blockedIds;

    return await this.repository.save(existing);
  }

  async delete(userId: string, guildId: string): Promise<boolean> {
    const result = await this.repository.delete({ userId, guildId });
    return (result.affected ?? 0) > 0;
  }

  async deleteByUser(userId: string): Promise<number> {
    const result = await this.repository.delete({ userId });
    return result.affected ?? 0;
  }
}
