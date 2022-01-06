import { TextChannel } from 'discord.js';
import { Language } from '../../structures/structures/types';

export function clearReply(language: Language, number: number, channel: TextChannel) {
  if (language === 'portuguese') return `Foram deletadas **${number}** mensagens do canal ${channel}.`;
  if (language === 'english') return `**${number}** messages was deleted from channel ${channel}.`;
  return `**${number}** messages was deleted from channel ${channel}.`;
}

export function clearError(language: Language) {
  if (language === 'portuguese') return 'Só é possível limpar mensagens em canais de textos';
  if (language === 'english') return 'Is only possible to clear messages from text channels';
  return 'Is only possible to clear messages from text channels';
}
