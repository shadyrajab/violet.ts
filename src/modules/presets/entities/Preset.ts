import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('presets')
export class Preset {
  @PrimaryColumn({ name: 'user_id', type: 'varchar', length: 20 })
  userId!: string;

  @PrimaryColumn({ name: 'guild_id', type: 'varchar', length: 20 })
  guildId!: string;

  @Column({ type: 'varchar', length: 100, default: 'default' })
  name!: string;

  @Column({ type: 'boolean', default: false })
  hide!: boolean;

  @Column({ type: 'boolean', default: false })
  lock!: boolean;

  @Column('text', { name: 'member_ids', array: true, default: () => 'ARRAY[]::text[]' })
  memberIds!: string[];

  @Column('text', { name: 'admin_ids', array: true, default: () => 'ARRAY[]::text[]' })
  adminIds!: string[];

  @Column('text', { name: 'blocked_ids', array: true, default: () => 'ARRAY[]::text[]' })
  blockedIds!: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  addMember(memberId: string): void {
    if (!this.memberIds.includes(memberId)) {
      this.memberIds.push(memberId);
    }
  }

  removeMember(memberId: string): void {
    this.memberIds = this.memberIds.filter(id => id !== memberId);
  }

  addAdmin(adminId: string): void {
    if (!this.adminIds.includes(adminId)) {
      this.adminIds.push(adminId);
    }
  }

  removeAdmin(adminId: string): void {
    this.adminIds = this.adminIds.filter(id => id !== adminId);
  }

  blockMember(memberId: string): void {
    if (!this.blockedIds.includes(memberId)) {
      this.blockedIds.push(memberId);
    }
  }

  unblockMember(memberId: string): void {
    this.blockedIds = this.blockedIds.filter(id => id !== memberId);
  }

  setName(name: string): void {
    this.name = name;
  }

  setHide(hide: boolean): void {
    this.hide = hide;
  }

  setLock(lock: boolean): void {
    this.lock = lock;
  }

  static createDefault(userId: string, guildId: string): Preset {
    const preset = new Preset();
    preset.userId = userId;
    preset.guildId = guildId;
    preset.name = 'default';
    preset.hide = false;
    preset.lock = false;
    preset.memberIds = [];
    preset.adminIds = [];
    preset.blockedIds = [];
    return preset;
  }
}
