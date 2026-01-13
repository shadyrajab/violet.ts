import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Language } from '../../../core/types';

@Entity('users')
export class User {
  @PrimaryColumn({ name: 'user_id', length: 20 })
  userId!: string;

  @Column({ type: 'varchar', length: 20, default: 'english' })
  language!: Language;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
