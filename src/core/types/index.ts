export type Language = 'english' | 'portuguese' | 'spanish' | 'korean' | 'japanese';

export interface IConfig {
  discord: {
    token: string;
    clientId: string;
  };
  database: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  };
  app: {
    environment: 'development' | 'production';
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
}

export interface IGuildSettings {
  serverId: string;
  language: Language;
  categoryId: string | null;
  channelId: string | null;
}

export interface IUserProfile {
  userId: string;
  language: Language;
}

export interface IVoiceRoom {
  channelId: string;
  ownerId: string;
  adminIds: string[];
  createdAt: Date;
}

export interface IPreset {
  userId: string;
  guildId: string;
  name: string;
  hide: boolean;
  lock: boolean;
  memberIds: string[];
  adminIds: string[];
  blockedIds: string[];
}

export interface ISubscription {
  id: string;
  userId: string;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  planType: 'free' | 'basic' | 'premium' | 'enterprise';
  currentPeriodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserServerSubscription {
  id: string;
  userId: string;
  serverId: string;
  subscriptionId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum VoiceChannelPermission {
  ADD_MEMBER = 'ADD_MEMBER',
  REMOVE_MEMBER = 'REMOVE_MEMBER',
  ADD_ADMIN = 'ADD_ADMIN',
  REMOVE_ADMIN = 'REMOVE_ADMIN',
  BLOCK_MEMBER = 'BLOCK_MEMBER',
  UNBLOCK_MEMBER = 'UNBLOCK_MEMBER',
  LOCK = 'LOCK',
  UNLOCK = 'UNLOCK',
  HIDE = 'HIDE',
  UNHIDE = 'UNHIDE',
  RENAME = 'RENAME'
}

export interface IPermissionUpdate {
  channelId: string;
  targetUserId?: string;
  operation: VoiceChannelPermission;
  newName?: string;
}
