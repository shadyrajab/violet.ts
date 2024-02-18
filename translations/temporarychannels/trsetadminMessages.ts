import { Language } from '../../structures/types';

export function traddAdminReply(language: Language, members: string) {
  if (language === 'portuguese') return `Você adicionou ${members} como administrador da sua sala. Use **/tremove** para removê-lo(s).`;
  if (language === 'english') return `You have added ${members} as administrator from your channel. Use **/tremove** to remove them.`;
  return `You have added ${members} as administrator from your channel. Use **/tremove** to remove them.`;
}

export function tremoveAdminReply(language: Language, members: string) {
  if (language === 'portuguese') return `Você removeu ${members} de administrador da sua sala.`;
  if (language === 'english') return `You have removed the ${members} administrator from your channel.`;
  return `You have removed the ${members} administrator from your channel.`;
}
