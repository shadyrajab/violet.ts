import { Language } from '../../structures/structures/types';

export function trhideReply(language: Language) {
  if (language === 'portuguese') return 'Você removeu a visibilidade do seu canal. Para adicioná-la novamente, use **trunhide**. Caso queira remover a visibilidade apenas para um usuário ou cargo, use **/trblock**';
  if (language === 'english') return 'You have removed the visiblity from your channel. To add it again, use **/trunhide**. If you want to remove the visiblity only for a user or role, use **/trblock**';
  return 'You have removed the visiblity from your channel. To add it again, use **/trunhide**. If you want to remove the visiblity only for a user or role, use **/trblock**';
}

export function trunhideReply(language: Language) {
  if (language === 'portuguese') return 'Você removeu a invisibilidade do seu canal.';
  if (language === 'english') return 'You have removed the invisibility from your channel.';
  return 'You have removed the invisibility from your channel.';
}
