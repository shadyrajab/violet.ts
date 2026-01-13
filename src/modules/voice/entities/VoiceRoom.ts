import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('voice_rooms')
export class VoiceRoom {
  @PrimaryColumn({ name: 'channel_id', type: 'varchar', length: 20 })
  channelId!: string;

  @Column({ name: 'owner_id', type: 'varchar', length: 20 })
  ownerId!: string;

  @Column('text', { name: 'admin_ids', array: true, default: () => 'ARRAY[]::text[]' })
  adminIds!: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  isOwner(userId: string): boolean {
    return this.ownerId === userId;
  }

  isAdmin(userId: string): boolean {
    return this.adminIds.includes(userId);
  }

  hasPermission(userId: string): boolean {
    return this.isOwner(userId) || this.isAdmin(userId);
  }

  addAdmin(userId: string): void {
    if (!this.isAdmin(userId)) {
      this.adminIds.push(userId);
    }
  }

  removeAdmin(userId: string): void {
    this.adminIds = this.adminIds.filter(id => id !== userId);
  }
}
