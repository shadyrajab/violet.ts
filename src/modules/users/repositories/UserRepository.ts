import { singleton, inject } from 'tsyringe';
import { Repository } from 'typeorm';
import { User } from '../entities/User';
import { Language } from '../../../core/types';

@singleton()
export class UserRepository {
  constructor(
    @inject('UserRepository') private repository: Repository<User>
  ) {}

  async findById(userId: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { userId }
    });
  }

  async create(userId: string, language: Language = 'english'): Promise<User> {
    const user = new User();
    user.userId = userId;
    user.language = language;

    return await this.repository.save(user);
  }

  async updateLanguage(userId: string, language: Language): Promise<User | null> {
    const user = await this.findById(userId);
    if (!user) {
      return null;
    }

    user.language = language;
    return await this.repository.save(user);
  }

  async findOrCreate(userId: string, defaultLanguage: Language = 'english'): Promise<User> {
    const existing = await this.findById(userId);
    if (existing) {
      return existing;
    }
    return await this.create(userId, defaultLanguage);
  }

  async delete(userId: string): Promise<boolean> {
    const result = await this.repository.delete({ userId });
    return (result.affected ?? 0) > 0;
  }
}
