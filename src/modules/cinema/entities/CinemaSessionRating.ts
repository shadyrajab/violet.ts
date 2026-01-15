import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CinemaSession } from './CinemaSession';

@Entity('cinema_session_ratings')
export class CinemaSessionRating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'session_id' })
  sessionId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'smallint' })
  rating: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => CinemaSession, session => session.ratings)
  @JoinColumn({ name: 'session_id' })
  session: CinemaSession;
}
