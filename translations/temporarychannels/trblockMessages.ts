import { Language } from '../../structures/structures/types';

export function trblockReply(language: Language, members: string) {
  if (language === 'portuguese') return `Você bloqueou ${members} da sua sala. Use **/trunblock** para desbloqueâ-lo(s)`;
  if (language === 'english') return `You have blocked ${members} from your channel. Use **/trunblock** to unblock them.`;
  return `You have blocked ${members} from your channel. Use **/trunblock** to unblock them.`;
}

export function trunblockReply(language: Language, members: string) {
  if (language === 'portuguese') return `Você desbloqueou ${members} da sua sala.`;
  if (language === 'english') return `You have unblocked ${members} from your channel.`;
  return `You have unblocked ${members} from your channel.`;
}
