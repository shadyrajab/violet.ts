export type Locale = 'en' | 'pt' | 'es' | 'fr' | 'it' | 'de' | 'pl';

export const DEFAULT_LOCALE: Locale = 'en';

export const SUPPORTED_LOCALES: Locale[] = ['en', 'pt', 'es', 'fr', 'it', 'de', 'pl'];

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  pt: 'Português',
  es: 'Español',
  fr: 'Français',
  it: 'Italiano',
  de: 'Deutsch',
  pl: 'Polski'
};

export const DISCORD_LOCALE_MAP: Record<string, Locale> = {
  'en-US': 'en',
  'en-GB': 'en',
  'pt-BR': 'pt',
  'es-ES': 'es',
  'es-419': 'es',
  'fr': 'fr',
  'it': 'it',
  'de': 'de',
  'pl': 'pl'
};

export interface TranslationSchema {
  common: {
    yes: string;
    no: string;
    none: string;
    error: string;
    success: string;
    loading: string;
    cancel: string;
    confirm: string;
    delete: string;
    save: string;
    edit: string;
    add: string;
    remove: string;
    back: string;
    next: string;
    previous: string;
    close: string;
    more: string;
  };
  errors: {
    generic: string;
    userNotFound: string;
    memberNotFound: string;
    dataNotFound: string;
    permissionsRemoved: string;
    onlyGuilds: string;
    unavailableCommand: string;
    needPermission: string;
    notAdmin: string;
    notOwner: string;
    notConnected: string;
    simultaneousChannelLimit: string;
    characterLimitReached: string;
  };
  voice: {
    channel: {
      locked: string;
      unlocked: string;
      hidden: string;
      visible: string;
      renamed: string;
    };
    controlPanel: {
      title: string;
      channelLabel: string;
      ownerLabel: string;
      statusLabel: string;
      adminsLabel: string;
      allowedMembersLabel: string;
      blockedMembersLabel: string;
      quickActionsLabel: string;
      quickActionsValue: string;
      footer: string;
    };
    buttons: {
      lock: string;
      unlock: string;
      hide: string;
      unhide: string;
      rename: string;
      invite: string;
      kick: string;
      setAdmin: string;
    };
    modals: {
      renameTitle: string;
      renameLabel: string;
      renamePlaceholder: string;
      inviteTitle: string;
      inviteLabel: string;
      invitePlaceholder: string;
      kickTitle: string;
      kickLabel: string;
      kickPlaceholder: string;
      setAdminTitle: string;
      setAdminLabel: string;
      setAdminPlaceholder: string;
    };
    messages: {
      channelLocked: string;
      channelUnlocked: string;
      channelHidden: string;
      channelVisible: string;
      channelRenamed: string;
      memberInvited: string;
      memberKicked: string;
      adminAdded: string;
      adminRemoved: string;
      memberAdded: string;
      memberRemoved: string;
      memberBlocked: string;
      memberUnblocked: string;
      cannotKickOwner: string;
      userNotFoundInChannel: string;
    };
  };
  setup: {
    activated: string;
    alreadyActivated: string;
    disabled: string;
    alreadyDisabled: string;
    joinChannelName: string;
    memberJoined: string;
    memberLeft: string;
  };
  presets: {
    notFound: string;
    created: string;
    limitReached: string;
    deleted: string;
    willBeLocked: string;
    willBeHidden: string;
    embedTitle: string;
    embedChannelName: string;
    embedLock: string;
    embedHide: string;
    embedMembers: string;
    embedAdmins: string;
    embedBlocked: string;
    embedDelete: string;
    embedObs: string;
    whatName: string;
    removeOrAdd: string;
    addMember: string;
    removeMember: string;
  };
}
