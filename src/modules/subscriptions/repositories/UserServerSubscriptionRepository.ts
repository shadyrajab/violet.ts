import { singleton, inject } from 'tsyringe';
import { Repository } from 'typeorm';
import { UserServerSubscription } from '../entities/UserServerSubscription';

@singleton()
export class UserServerSubscriptionRepository {
  constructor(
    @inject('UserServerSubscriptionRepository') private repository: Repository<UserServerSubscription>
  ) {}

  async findById(id: string): Promise<UserServerSubscription | null> {
    return await this.repository.findOne({
      where: { id }
    });
  }

  async findByUserAndServer(userId: string, serverId: string): Promise<UserServerSubscription | null> {
    return await this.repository.findOne({
      where: { userId, serverId, isActive: true }
    });
  }

  async findByUser(userId: string): Promise<UserServerSubscription[]> {
    return await this.repository.find({
      where: { userId, isActive: true }
    });
  }

  async findByServer(serverId: string): Promise<UserServerSubscription[]> {
    return await this.repository.find({
      where: { serverId, isActive: true }
    });
  }

  async create(
    id: string,
    userId: string,
    serverId: string,
    subscriptionId: string
  ): Promise<UserServerSubscription> {
    const userServerSubscription = new UserServerSubscription();
    userServerSubscription.id = id;
    userServerSubscription.userId = userId;
    userServerSubscription.serverId = serverId;
    userServerSubscription.subscriptionId = subscriptionId;
    userServerSubscription.isActive = true;

    return await this.repository.save(userServerSubscription);
  }

  async deactivate(id: string): Promise<UserServerSubscription | null> {
    const userServerSubscription = await this.findById(id);
    if (!userServerSubscription) {
      return null;
    }

    userServerSubscription.isActive = false;
    return await this.repository.save(userServerSubscription);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete({ id });
    return (result.affected ?? 0) > 0;
  }
}
