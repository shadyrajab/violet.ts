import { Language } from '../../structures/types';

export function traddMemberReply(language: Language, members: string) {
  if (language === 'portuguese') return `Você adicionou ${members} em sua sala. Use **/tremove** para removê-lo(s).`;
  if (language === 'english') return `You have added ${members} in your room. Use **/tremove** to remove them.`;
  return `You have added ${members} in your room. Use **/tremove** to remove them.`;
}

export function tremoveMemberReply(language: Language, members: string) {
  if (language === 'portuguese') return `Você removeu ${members} da sua sala.`;
  if (language === 'english') return `You have removed ${members} from your channel.`;
  return `You have removed ${members} from your channel.`;
}
