import { Language } from '../../structures/structures/types';

export function changeLanguageReply(language: Language) {
  if (language === 'portuguese') return `Minha língua foi alterada para \`\`${language}\`\`.`;
  if (language === 'english') return `My language was changed to \`\`${language}\`\`.`;
  return `You changed our personal language to **${language}**.` + "\nThis message still don't have a translation for your language. If you want to help Violet to reach more languages, access: https://github.com/shadyrajab/violet.js/tree/master/translations";
}

export function changeMyLanguageReply(language: Language) {
  if (language === 'portuguese') return `Você alterou nossa língua pessoal para **${language}**.`;
  if (language === 'english') return `You changed our personal language to **${language}**.`;
  return `You changed our personal language to **${language}**.` + "\nThis message still don't have a translation for your language. If you want to help Violet to reach more languages, access: https://github.com/shadyrajab/violet.js/tree/master/translations";
}
