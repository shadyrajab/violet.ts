import {Language} from '../structures/structures/types';

export function userNotFound(language: Language, nick: string) {
  if (language === 'portuguese') return `Não foi possível encontrar o usuário de nick: **${nick}**.`;
  if (language === 'english') return `Don't was possible to find the user by nick **${nick}**.`;
  return `Don't was possible to find the user by nick **${nick}**.` + '\nThis message still don\'t have a translation for your language. If you want to help Violet to reach more languages, access: https://github.com/shadyrajab/violet.js/tree/master/translations';
}

export function dataNotFound(language: Language) {
  if (language === 'portuguese') return 'Não foi possível encontrar dados para este usuário.';
  if (language === 'english') return 'No data from this user were found.';
  return 'No data from this user were found.' + '\nThis message still don\'t have a translation for your language. If you want to help Violet to reach more languages, access: https://github.com/shadyrajab/violet.js/tree/master/translations';
}

export function permissionsRemoved(language: Language) {
  if (language === 'portuguese') return 'Alguém tirou minhas permissões necessárias para realizar o seu pedido. Por favor, me dê permissão de \`\`Administrador\`\` para que eu possa realizar essa e outras tarefas normalmente.';
  if (language === 'english') return 'Someone removed my necessary permissions to realize your requests. Please give me the \`\`Administrator\`\` permission to I can realize that and other tasks normally.';
  return 'Someone removed my necessary permissions to realize your requests. Please give me the \`\`Administrator\`\` permission to I can realize that and other tasks normally.' + '\nThis message still don\'t have a translation for your language. If you want to help Violet to reach more languages, access: https://github.com/shadyrajab/violet.js/tree/master/translations';
}

export function finished(language: Language) {
  if (language === 'portuguese') return 'Prontinho! 😊';
  if (language === 'english') return 'Finished! 😊';
  return 'Finished! =D';
}
