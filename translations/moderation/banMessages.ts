import { User } from 'discord.js';
import { Language } from '../../structures/structures/types';

export function bannedBy(language: Language) {
  if (language === 'portuguese') return '📌 Banido por';
  if (language === 'english') return '📌 Banned by';
  return '📌 Banned by';
}

export function banMessage(language: Language, firstUser: User, secondUser: User | null | string, reason: string | null) {
  if (!secondUser) secondUser = '' as string;
  if (!reason) reason = '';
  if (language === 'portuguese') return `Você baniu ${firstUser}${secondUser} permanentemente do servidor pelo motivo: **${reason}**.`;
  if (language === 'english') return `You have banned ${firstUser}${secondUser} permanently from the server for the reason: **${reason}**.`;
  return `You have banned ${firstUser}${secondUser} permanently from the server for the reason: **${reason}**.`;
}

export function bannedFrom(language: Language, server: string) {
  if (language === 'portuguese') return `Você foi banido do servidor: ${server}`;
  if (language === 'english') return `You are banned from the server: ${server}`;
  return `You are banned from the server: ${server}`;
}
