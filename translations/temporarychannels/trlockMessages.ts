import { Language } from '../../structures/types';

export function trlockReply(language: Language) {
  if (language === 'portuguese') return 'Você trancou sua sala com sucesso! Para destrancá-la, use **trunlock**. Caso queira deixar o canal inacessível apenas para um usuário ou cargo, use **/trblock**';
  if (language === 'english') return 'You have locked your channel successfully! To unlock it, use **/trunlock**.  If you want the channel inaccessible only for a user or role, use **/trblock**';
  return 'You have locked your channel successfully! To unlock it, use **/trunlock**.  If you want the channel inaccessible only for a user or role, use **/trblock**';
}

export function trunlockReply(language: Language) {
  if (language === 'portuguese') return 'Você destrancou sua sala com sucesso!';
  if (language === 'english') return 'You have unlocked your channel succesfully!';
  return 'You have unlocked your channel succesfully!';
}
