import { Language } from '../../structures/types';

export function trenameReply(language: Language, name: string) {
  if (language === 'portuguese') return `Você renomeou seu canal para **${name}**!`;
  if (language === 'english') return `You have renamed your channel to **${name}**!`;
  return `You have renamed your channel to **${name}**!`;
}
