import { injectable, inject } from 'tsyringe';
import { Repository } from 'typeorm';
import { CinemaSessionRating } from '../entities/CinemaSessionRating';

@injectable()
export class CinemaSessionRatingRepository {
  constructor(
    @inject('CinemaSessionRatingRepository') private repository: Repository<CinemaSessionRating>
  ) {}

  async findBySessionAndUser(sessionId: string, userId: string): Promise<CinemaSessionRating | null> {
    return this.repository.findOne({
      where: { sessionId, userId }
    });
  }

  async findBySession(sessionId: string): Promise<CinemaSessionRating[]> {
    return this.repository.find({
      where: { sessionId }
    });
  }

  async findByUser(userId: string): Promise<CinemaSessionRating[]> {
    return this.repository.find({
      where: { userId },
      relations: ['session']
    });
  }

  async create(rating: Partial<CinemaSessionRating>): Promise<CinemaSessionRating> {
    const entity = this.repository.create(rating);
    return this.repository.save(entity);
  }

  async getAverageRating(sessionId: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('rating')
      .select('AVG(rating.rating)', 'avg')
      .where('rating.session_id = :sessionId', { sessionId })
      .getRawOne();

    return result?.avg ? parseFloat(result.avg) : 0;
  }
}
