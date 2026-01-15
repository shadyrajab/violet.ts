import { singleton, inject } from 'tsyringe';
import { UserRepository } from '../repositories/UserRepository';
import { User } from '../entities/User';
import { Locale, DEFAULT_LOCALE } from '../../../core/i18n';
import { Logger } from '../../../core/logger';

@singleton()
export class UserService {
  constructor(
    @inject(UserRepository) private userRepository: UserRepository,
    @inject(Logger) private logger: Logger
  ) {}

  async getUserLanguage(userId: string): Promise<Locale> {
    try {
      const user = await this.userRepository.findById(userId);
      return (user?.language as Locale) ?? DEFAULT_LOCALE;
    } catch (error) {
      this.logger.error('Failed to get user language', error as Error, { userId });
      return DEFAULT_LOCALE;
    }
  }

  async setUserLanguage(userId: string, language: Locale): Promise<User> {
    try {
      const user = await this.userRepository.findOrCreate(userId, language);

      if (user.language !== language) {
        const updated = await this.userRepository.updateLanguage(userId, language);
        this.logger.info('User language updated', { userId, language });
        return updated!;
      }

      return user;
    } catch (error) {
      this.logger.error('Failed to set user language', error as Error, { userId, language });
      throw error;
    }
  }

  async getOrCreateUser(userId: string, defaultLanguage: Locale = DEFAULT_LOCALE): Promise<User> {
    try {
      return await this.userRepository.findOrCreate(userId, defaultLanguage);
    } catch (error) {
      this.logger.error('Failed to get or create user', error as Error, { userId });
      throw error;
    }
  }
}
