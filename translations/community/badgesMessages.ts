import { Client, User } from 'discord.js';
import { Language } from '../../structures/structures/types';

export function anyBadge(language: Language) {
  if (language === 'portuguese') return 'Você ainda não possui nenhuma insígnia. Conquiste suas insígnias interagindo com o bot, trocando com outros usuários e participando de eventos!';
  if (language === 'english') return "You still don't have any badge. Conquer your badges interacting with the bot, trading with other users and participating the events!";
  return "You still don't have any badge. Conquer your badges interacting with the bot, trading with other users and participating the events!" + "\nThis message still don't have a translation for your language. If you want to help Violet to reach more languages, access: https://github.com/shadyrajab/violet.js/tree/master/translations";
}

export function acquisitionDate(language: Language) {
  if (language === 'portuguese') return '📅 Aquisição';
  if (language === 'english') return '📅 Acquisition';
  return '📅 Acquisition';
}

export function negociable(language: Language, client: Client) {
  const violet = client.emojis.cache.get('923266214313226281');
  if (language === 'portuguese') return `${violet} Negociável`;
  if (language === 'english') return `${violet} Negociable`;
  return `${violet} Negociable`;
}

export function description(language: Language) {
  if (language === 'portuguese') return ' 📃 Descrição';
  if (language === 'english') return ' 📃 Description';
  return ' 📃 Description';
}

export function belongsTo(language: Language) {
  if (language === 'portuguese') return 'Pertence à';
  if (language === 'english') return 'Belongs to';
  return 'Belongs to';
}

export function page(language: Language) {
  if (language === 'portuguese') return 'Página';
  if (language === 'english') return 'Page';
  return 'Page';
}

export function newBadge(language: Language, user: User) {
  if (language === 'portuguese') return `🎁 Parabéns ${user}! Uma nova insígnia foi adicionada à sua coleção! Para ver suas insígnias, use o comando **/badges**.`;
  if (language === 'english') return `🎁 Congratulations ${user}! A new badge was added to your collection! To view all your badges, use the command **/badges**.`;
  return `🎁 Congratulations ${user}! A new badge was added to your collection! To view all your badges, use the command **/badges**.` + "\nThis message still don't have a translation for your language. If you want to help Violet to reach more languages, access: https://github.com/shadyrajab/violet.js/tree/master/translations";
}

export function alreadyHave(language: Language) {
  if (language === 'portuguese') return 'Ups, parece que eu já tinha te dado esse presente antes, um "Eu te amo" serve? Te amo <3.';
  if (language === 'english') return 'Ups, I think I already gived you that gift, can I say "I love you" instead? I love you <3.';
  return 'Ups, I think I already gived you that gift, can I say "I love you" instead? I love you <3.' + "\nThis message still don't have a translation for your language. If you want to help Violet to reach more languages, access: https://github.com/shadyrajab/violet.js/tree/master/translations";
}
