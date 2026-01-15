import { singleton, inject } from 'tsyringe';
import { Guild, ChannelType, PermissionFlagsBits } from 'discord.js';
import { VoiceProfileRepository } from '../repositories/VoiceProfileRepository';
import { SubscriptionService } from '../../subscriptions/services/SubscriptionService';
import { ServerService } from '../../servers/services/ServerService';
import { VoiceProfile, ProfileType } from '../entities/VoiceProfile';
import { Logger } from '../../../core/logger';
import { Observability } from '../../../core/observability';
import { t } from '../../../core/i18n';

@singleton()
export class VoiceProfileService {
  constructor(
    @inject(VoiceProfileRepository) private profileRepository: VoiceProfileRepository,
    @inject(SubscriptionService) private subscriptionService: SubscriptionService,
    @inject(ServerService) private serverService: ServerService,
    @inject(Logger) private logger: Logger
  ) {}

  async canCreateProfile(userId: string, guildId: string): Promise<{ canCreate: boolean; reason?: string }> {
    try {
      const isServerPremium = await this.subscriptionService.isServerPremium(guildId);

      if (isServerPremium) {
        return { canCreate: true };
      }

      const existingProfilesCount = await this.profileRepository.countByGuild(guildId);

      if (existingProfilesCount >= 1) {
        return {
          canCreate: false,
          reason: 'Free servers can only have 1 profile. Link a Premium subscription to this server for unlimited profiles.'
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
    profileName: string,
    profileType: ProfileType = 'voice'
  ): Promise<VoiceProfile> {
    return await Observability.executeWithSpan(
      'voice_profile.create',
      async () => {
        try {
          const existing = await this.profileRepository.findByGuildAndName(guild.id, profileName);
          if (existing) {
            throw new Error(`A profile with name "${profileName}" already exists in this server`);
          }

          const { canCreate, reason } = await this.canCreateProfile(ownerId, guild.id);
          if (!canCreate) {
            throw new Error(reason || 'Cannot create profile');
          }

          const serverLocale = await this.serverService.getServerLanguage(guild.id);

          const category = await guild.channels.create({
            name: profileName,
            type: ChannelType.GuildCategory,
            permissionOverwrites: [
              {
                id: guild.id,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]
              }
            ]
          });

          const channelName = profileType === 'cinema'
            ? 'Sessions'
            : t('setup.joinChannelName', undefined, serverLocale);

          const joinChannel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildVoice,
            parent: category.id,
            permissionOverwrites: [
              {
                id: guild.id,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]
              }
            ]
          });
          const joinChannelId = joinChannel.id;

          const profile = VoiceProfile.create(
            guild.id,
            ownerId,
            profileName,
            category.id,
            joinChannelId,
            profileType
          );

          const created = await this.profileRepository.create(profile);

          this.logger.info('Voice profile created', {
            profileId: created.id,
            guildId: guild.id,
            ownerId,
            profileName,
            profileType
          });

          return created;
        } catch (error) {
          this.logger.error('Error creating voice profile', error as Error, {
            guildId: guild.id,
            ownerId,
            profileName
          });
          Observability.captureError(error as Error, { guildId: guild.id, ownerId, profileName });
          throw error;
        }
      },
      'db',
      'voice_profile',
      'insert'
    );
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

  async deleteProfileFromDb(profileId: string): Promise<void> {
    try {
      await this.profileRepository.delete(profileId);
      this.logger.info('Voice profile deleted from database', { profileId });
    } catch (error) {
      this.logger.error('Error deleting profile from database', error as Error, { profileId });
      throw error;
    }
  }

  async getCinemaProfile(guildId: string): Promise<VoiceProfile | null> {
    try {
      return await this.profileRepository.findCinemaProfile(guildId);
    } catch (error) {
      this.logger.error('Error getting cinema profile', error as Error, { guildId });
      throw error;
    }
  }
}
