import {
  CategoryChannel, TextChannel, User, VoiceChannel,
} from 'discord.js';
import { Language } from '../../structures/structures/types';

export function lockReply(language: Language, user: User, channel: TextChannel | VoiceChannel | CategoryChannel) {
  if (language === 'portuguese') return `O canal ${channel} foi trancado por ${user}.`;
  if (language === 'english') return `The channel ${channel} was locked by ${user}.`;
  return `The channel ${channel} was locked by ${user}.`;
}

export function unlockReply(language: Language, user: User, channel: TextChannel | VoiceChannel | CategoryChannel) {
  if (language === 'portuguese') return `O canal ${channel} foi destrancado por ${user}.`;
  if (language === 'english') return `The channel ${channel} was unlocked by ${user}.`;
  return `The channel ${channel} was unlocked by ${user}.`;
}

export function unsuportedChannel(language: Language) {
  if (language === 'portuguese') return 'Não é possível trancar ou destrancar um canal desta categoria, apenas canais de texto, voz e categoria!';
  if (language === 'english') return 'Is not possible to lock or unlock a channel from this category, only channels of text, voice or category!';
  return 'Is not possible to lock or unlock a channel from this category, only channels of text, voice or category!';
}
