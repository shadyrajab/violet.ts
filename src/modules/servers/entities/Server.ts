import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Language } from '../../../core/types';

@Entity('servers')
export class Server {
  @PrimaryColumn({ name: 'server_id', type: 'varchar', length: 20 })
  serverId!: string;

  @Column({ type: 'varchar', length: 20, default: 'english' })
  language!: Language;

  @Column({ name: 'category_id', type: 'varchar', length: 20, nullable: true })
  categoryId!: string | null;

  @Column({ name: 'channel_id', type: 'varchar', length: 20, nullable: true })
  channelId!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  isConfigured(): boolean {
    return this.categoryId !== null && this.channelId !== null;
  }
}
