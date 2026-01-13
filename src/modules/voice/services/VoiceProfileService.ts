import { singleton, inject } from 'tsyringe';
import { Guild, ChannelType, PermissionFlagsBits } from 'discord.js';
import { VoiceProfileRepository } from '../repositories/VoiceProfileRepository';
import { SubscriptionService } from '../../subscriptions/services/SubscriptionService';
import { VoiceProfile } from '../entities/VoiceProfile';
import { Logger } from '../../../core/logger';

@singleton()
export class VoiceProfileService {
  constructor(
    @inject(VoiceProfileRepository) private profileRepository: VoiceProfileRepository,
    @inject(SubscriptionService) private subscriptionService: SubscriptionService,
    @inject(Logger) private logger: Logger
  ) {}

  async canCreateProfile(userId: string, guildId: string): Promise<{ canCreate: boolean; reason?: string }> {
    try {
      const subscription = await this.subscriptionService.getUserSubscription(userId);

      if (!subscription || !subscription.isActive()) {
        return { canCreate: false, reason: 'No active subscription found' };
      }

      if (subscription.isPremium()) {
        return { canCreate: true };
      }

      const existingProfilesCount = await this.profileRepository.countByOwner(userId, guildId);

      if (existingProfilesCount >= 1) {
        return {
          canCreate: false,
          reason: 'Free/Basic users can only create 1 profile. Upgrade to Premium for unlimited profiles.'
        };
      }

      return { canCreate: true };
    } catch (error) {
      this.logger.error('Error checking if user can create profile', error as Error, { userId, guildId });
      throw error;
    }
  }

  async createProfile(
    guild: Guild,
    ownerId: string,
    profileName: string
  ): Promise<VoiceProfile> {
    try {
      const existing = await this.profileRepository.findByGuildAndName(guild.id, profileName);
      if (existing) {
        throw new Error(`A profile with name "${profileName}" already exists in this server`);
      }

      const { canCreate, reason } = await this.canCreateProfile(ownerId, guild.id);
      if (!canCreate) {
        throw new Error(reason || 'Cannot create profile');
      }

      const category = await guild.channels.create({
        name: `📁 ${profileName}`,
        type: ChannelType.GuildCategory,
        permissionOverwrites: [
          {
            id: guild.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]
          }
        ]
      });

      const joinChannel = await guild.channels.create({
        name: 'Entre aqui',
        type: ChannelType.GuildVoice,
        parent: category.id,
        permissionOverwrites: [
          {
            id: guild.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]
          }
        ]
      });

      const profile = VoiceProfile.create(
        guild.id,
        ownerId,
        profileName,
        category.id,
        joinChannel.id
      );

      const created = await this.profileRepository.create(profile);

      this.logger.info('Voice profile created', {
        profileId: created.id,
        guildId: guild.id,
        ownerId,
        profileName
      });

      return created;
    } catch (error) {
      this.logger.error('Error creating voice profile', error as Error, {
        guildId: guild.id,
        ownerId,
        profileName
      });
      throw error;
    }
  }

  async getProfile(profileName: string, guildId: string): Promise<VoiceProfile | null> {
    try {
      return await this.profileRepository.findByGuildAndName(guildId, profileName);
    } catch (error) {
      this.logger.error('Error getting profile', error as Error, { profileName, guildId });
      throw error;
    }
  }

  async getGuildProfiles(guildId: string): Promise<VoiceProfile[]> {
    try {
      return await this.profileRepository.findByGuild(guildId);
    } catch (error) {
      this.logger.error('Error getting guild profiles', error as Error, { guildId });
      throw error;
    }
  }

  async getUserProfiles(userId: string, guildId: string): Promise<VoiceProfile[]> {
    try {
      return await this.profileRepository.findByOwner(userId, guildId);
    } catch (error) {
      this.logger.error('Error getting user profiles', error as Error, { userId, guildId });
      throw error;
    }
  }

  async disableProfile(profileName: string, guildId: string): Promise<VoiceProfile> {
    try {
      const profile = await this.profileRepository.findByGuildAndName(guildId, profileName);

      if (!profile) {
        throw new Error(`Profile "${profileName}" not found`);
      }

      if (!profile.isActive) {
        throw new Error(`Profile "${profileName}" is already disabled`);
      }

      profile.deactivate();
      const updated = await this.profileRepository.update(profile);

      this.logger.info('Voice profile disabled', {
        profileId: profile.id,
        guildId,
        profileName
      });

      return updated;
    } catch (error) {
      this.logger.error('Error disabling profile', error as Error, { profileName, guildId });
      throw error;
    }
  }

  async enableProfile(profileName: string, guildId: string): Promise<VoiceProfile> {
    try {
      const profile = await this.profileRepository.findByGuildAndName(guildId, profileName);

      if (!profile) {
        throw new Error(`Profile "${profileName}" not found`);
      }

      if (profile.isActive) {
        throw new Error(`Profile "${profileName}" is already enabled`);
      }

      profile.activate();
      const updated = await this.profileRepository.update(profile);

      this.logger.info('Voice profile enabled', {
        profileId: profile.id,
        guildId,
        profileName
      });

      return updated;
    } catch (error) {
      this.logger.error('Error enabling profile', error as Error, { profileName, guildId });
      throw error;
    }
  }

  async deleteProfile(profileId: string, guild: Guild): Promise<void> {
    try {
      const profile = await this.profileRepository.findById(profileId);

      if (!profile) {
        throw new Error('Profile not found');
      }

      const category = await guild.channels.fetch(profile.categoryId).catch(() => null);
      if (category) {
        await category.delete('Profile deleted');
      }

      await this.profileRepository.delete(profileId);

      this.logger.info('Voice profile deleted', {
        profileId,
        guildId: guild.id
      });
    } catch (error) {
      this.logger.error('Error deleting profile', error as Error, { profileId });
      throw error;
    }
  }

  async getProfileByJoinChannel(joinChannelId: string): Promise<VoiceProfile | null> {
    try {
      return await this.profileRepository.findActiveByJoinChannel(joinChannelId);
    } catch (error) {
      this.logger.error('Error getting profile by join channel', error as Error, { joinChannelId });
      throw error;
    }
  }
}
