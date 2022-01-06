import { Language } from '../../structures/structures/types';

export function noneExistent(language: Language, nick: string) {
  if (language === 'portuguese') return `O nick **${nick}** não existe, isso quer dizer que o nick está disponível para uso.`;
  if (language === 'english') return `The nick **${nick}** doesn't exist, it means that the nick is available.`;
  return `The nick **${nick}** doesn't exist, it means that the nick is available.`;
}

export function availableTime(language: Language, summoner: string, days: number) {
  if (language === 'portuguese') return `O nick **${summoner}** ficará disponível em **${days}** dia(s) caso continue inativo.`;
  if (language === 'english') return `The nick **${summoner}** will be available in **${days}** days if continue inactive.`;
  return `The nick **${summoner}** will be available in **${days}** days if continue inactive.`;
}
