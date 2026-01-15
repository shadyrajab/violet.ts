import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { CinemaSessionRating } from './CinemaSessionRating';

@Entity('cinema_sessions')
export class CinemaSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'guild_id' })
  guildId: string;

  @Column({ name: 'tmdb_id' })
  tmdbId: number;

  @Column()
  title: string;

  @Column({ name: 'poster_path', type: 'varchar', length: 255, nullable: true })
  posterPath: string | null;

  @Column({ name: 'runtime' })
  runtime: number;

  @Column({ name: 'channel_id' })
  channelId: string;

  @Column({ name: 'event_id', type: 'varchar', length: 20, nullable: true })
  eventId: string | null;

  @Column({ name: 'hosted_by' })
  hostedBy: string;

  @Column({ name: 'scheduled_start', type: 'timestamp' })
  scheduledStart: Date;

  @Column({ name: 'scheduled_end', type: 'timestamp' })
  scheduledEnd: Date;

  @Column({ name: 'attendees', type: 'text', array: true, default: '{}' })
  attendees: string[];

  @Column({ default: 'scheduled' })
  status: 'scheduled' | 'active' | 'finished' | 'cancelled';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => CinemaSessionRating, rating => rating.session)
  ratings: CinemaSessionRating[];

  addAttendee(userId: string): void {
    if (!this.attendees.includes(userId)) {
      this.attendees.push(userId);
    }
  }

  removeAttendee(userId: string): void {
    this.attendees = this.attendees.filter(id => id !== userId);
  }

  getAverageRating(): number {
    if (!this.ratings || this.ratings.length === 0) return 0;
    const sum = this.ratings.reduce((acc, r) => acc + r.rating, 0);
    return sum / this.ratings.length;
  }
}
