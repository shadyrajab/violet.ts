import { Language } from '../../../core/types';

export function trsetupReply(language: Language) {
  if (language === 'portuguese') return 'Sistema de salas temporárias ativado com sucesso!';
  if (language === 'english') return 'Temporary channels system activated succesfully!';
  return 'Temporary channels system activated succesfully!' + '\nThis message still don\'t have a translation for your language. If you want to help Violet to reach more languages, access: https://github.com/shadyrajab/violet.js/tree/master/translations';
}

export function alreadyActivated(language: Language) {
  if (language === 'portuguese') return 'O sistema de salas temporárias já está ativado.';
  if (language === 'english') return 'Temporary channels system is already activated.';
  return 'Temporary channels system activated succesfully!' + '\nThis message still don\'t have a translation for your language. If you want to help Violet to reach more languages, access: https://github.com/shadyrajab/violet.js/tree/master/translations';
}

export function trdisableReply(language: Language) {
  if (language === 'portuguese') return 'Sistema de salas temporárias desativado com sucesso!';
  if (language === 'english') return 'Temporary channels system disabled succesfully!';
  return 'Temporary channels system activated succesfully!' + '\nThis message still don\'t have a translation for your language. If you want to help Violet to reach more languages, access: https://github.com/shadyrajab/violet.js/tree/master/translations';
}

export function alreadyDisabled(language: Language) {
  if (language === 'portuguese') return 'O sistema de salas temporários já está desativado.';
  if (language === 'english') return 'Temporary channels system is already disabled.';
  return 'Temporary channels system activated succesfully!' + '\nThis message still don\'t have a translation for your language. If you want to help Violet to reach more languages, access: https://github.com/shadyrajab/violet.js/tree/master/translations';
}
