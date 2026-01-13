import { singleton, inject } from 'tsyringe';
import { PresetRepository } from '../repositories/PresetRepository';
import { Preset } from '../entities/Preset';
import { Logger } from '../../../core/logger';
import { VoiceChannelPermission } from '../../../core/types';

@singleton()
export class PresetService {
  constructor(
    @inject(PresetRepository) private presetRepository: PresetRepository,
    @inject(Logger) private logger: Logger
  ) {}

  async getPreset(userId: string, guildId: string): Promise<Preset | null> {
    try {
      return await this.presetRepository.findByUserAndGuild(userId, guildId);
    } catch (error) {
      this.logger.error('Failed to get preset', error as Error, { userId, guildId });
      throw error;
    }
  }

  async getOrCreatePreset(userId: string, guildId: string): Promise<Preset> {
    try {
      const existing = await this.presetRepository.findByUserAndGuild(userId, guildId);

      if (existing) {
        return existing;
      }

      const defaultPreset = Preset.createDefault(userId, guildId);
      const created = await this.presetRepository.create(defaultPreset);

      this.logger.info('Default preset created', { userId, guildId });
      return created;
    } catch (error) {
      this.logger.error('Failed to get or create preset', error as Error, { userId, guildId });
      throw error;
    }
  }

  async updatePresetField(
    userId: string,
    guildId: string,
    operation: VoiceChannelPermission,
    value?: string | boolean
  ): Promise<Preset> {
    try {
      const preset = await this.getOrCreatePreset(userId, guildId);

      switch (operation) {
        case VoiceChannelPermission.RENAME:
          if (typeof value === 'string') {
            preset.setName(value);
          }
          break;

        case VoiceChannelPermission.HIDE:
          preset.setHide(true);
          break;

        case VoiceChannelPermission.UNHIDE:
          preset.setHide(false);
          break;

        case VoiceChannelPermission.LOCK:
          preset.setLock(true);
          break;

        case VoiceChannelPermission.UNLOCK:
          preset.setLock(false);
          break;

        case VoiceChannelPermission.ADD_MEMBER:
          if (typeof value === 'string') {
            preset.addMember(value);
          }
          break;

        case VoiceChannelPermission.REMOVE_MEMBER:
          if (typeof value === 'string') {
            preset.removeMember(value);
          }
          break;

        case VoiceChannelPermission.ADD_ADMIN:
          if (typeof value === 'string') {
            preset.addAdmin(value);
          }
          break;

        case VoiceChannelPermission.REMOVE_ADMIN:
          if (typeof value === 'string') {
            preset.removeAdmin(value);
          }
          break;

        case VoiceChannelPermission.BLOCK_MEMBER:
          if (typeof value === 'string') {
            preset.blockMember(value);
          }
          break;

        case VoiceChannelPermission.UNBLOCK_MEMBER:
          if (typeof value === 'string') {
            preset.unblockMember(value);
          }
          break;
      }

      const updated = await this.presetRepository.update(userId, guildId, preset);

      if (!updated) {
        throw new Error('Failed to update preset');
      }

      this.logger.info('Preset updated', { userId, guildId, operation });
      return updated;
    } catch (error) {
      this.logger.error('Failed to update preset field', error as Error, {
        userId,
        guildId,
        operation
      });
      throw error;
    }
  }

  async getUserPresets(userId: string): Promise<Preset[]> {
    try {
      return await this.presetRepository.findByUser(userId);
    } catch (error) {
      this.logger.error('Failed to get user presets', error as Error, { userId });
      throw error;
    }
  }

  async deletePreset(userId: string, guildId: string): Promise<void> {
    try {
      await this.presetRepository.delete(userId, guildId);
      this.logger.info('Preset deleted', { userId, guildId });
    } catch (error) {
      this.logger.error('Failed to delete preset', error as Error, { userId, guildId });
      throw error;
    }
  }

  async resetPreset(userId: string, guildId: string): Promise<Preset> {
    try {
      await this.presetRepository.delete(userId, guildId);

      const defaultPreset = Preset.createDefault(userId, guildId);
      const created = await this.presetRepository.create(defaultPreset);

      this.logger.info('Preset reset to default', { userId, guildId });
      return created;
    } catch (error) {
      this.logger.error('Failed to reset preset', error as Error, { userId, guildId });
      throw error;
    }
  }

  async updatePresetName(userId: string, guildId: string, name: string): Promise<Preset> {
    return this.updatePresetField(userId, guildId, VoiceChannelPermission.RENAME, name);
  }

  async updatePresetLock(userId: string, guildId: string, locked: boolean): Promise<Preset> {
    return this.updatePresetField(
      userId,
      guildId,
      locked ? VoiceChannelPermission.LOCK : VoiceChannelPermission.UNLOCK
    );
  }

  async updatePresetHide(userId: string, guildId: string, hidden: boolean): Promise<Preset> {
    return this.updatePresetField(
      userId,
      guildId,
      hidden ? VoiceChannelPermission.HIDE : VoiceChannelPermission.UNHIDE
    );
  }
}
