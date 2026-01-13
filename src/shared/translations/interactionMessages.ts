import { Language } from '../../core/types';

export function onlyGuilds(language: Language | string | null | undefined) {
  if (language === 'portuguese') return 'Esse comando só está disponível em servidores.';
  if (language === 'english') return 'This command is only available for guilds.';
  return 'This command is only available for guilds.' + "\nThis message still don't have a translation for your language. If you want to help Violet to reach more languages, access: https://github.com/shadyrajab/violet.js/tree/master/translations";
}

export function unavailableCommand(language: Language) {
  if (language === 'portuguese') return 'Este comando está desabilitado temporariamente';
  if (language === 'english') return 'This command is temporarialy unavailable.';
  return 'This command is temporarialy unavailable.' + "\nThis message still don't have a translation for your language. If you want to help Violet to reach more languages, access: https://github.com/shadyrajab/violet.js/tree/master/translations";
}

export function needPermission(language: Language, permission: string) {
  if (language === 'portuguese') return `Você precisa da permissão de \`\`${permission}\`\` para usar este comando.`;
  if (language === 'english') return `You need the \`\`${permission}\`\` permission to use this command.`;
  return `You need the \`\`${permission}\`\` permission to use this command.` + "\nThis message still don't have a translation for your language. If you want to help Violet to reach more languages, access: https://github.com/shadyrajab/violet.js/tree/master/translations";
}
