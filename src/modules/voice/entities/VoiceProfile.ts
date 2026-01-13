import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('voice_profiles')
export class VoiceProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'guild_id', type: 'varchar', length: 20 })
  guildId!: string;

  @Column({ name: 'owner_id', type: 'varchar', length: 20 })
  ownerId!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ name: 'category_id', type: 'varchar', length: 20 })
  categoryId!: string;

  @Column({ name: 'join_channel_id', type: 'varchar', length: 20 })
  joinChannelId!: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  activate(): void {
    this.isActive = true;
  }

  deactivate(): void {
    this.isActive = false;
  }

  static create(guildId: string, ownerId: string, name: string, categoryId: string, joinChannelId: string): VoiceProfile {
    const profile = new VoiceProfile();
    profile.guildId = guildId;
    profile.ownerId = ownerId;
    profile.name = name;
    profile.categoryId = categoryId;
    profile.joinChannelId = joinChannelId;
    profile.isActive = true;
    return profile;
  }
}
