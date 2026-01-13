import { Language } from '../../../core/types';

export function notAdmin(language: Language) {
  if (language === 'portuguese') return 'Você precisa ser administrador ou dono do canal para usar este comando.';
  if (language === 'english') return 'You need to be administrator or owner from the channel to use this command.';
  return 'You need to be administrator or owner from the channel to use this command.';
}

export function notOwner(language: Language) {
  if (language === 'portuguese') return 'Somente o dono do canal pode utilizar este comando!';
  if (language === 'english') return 'Only the channel owner can use this command!';
  return 'Only the channel owner can use this command!';
}

export function notConnected(language: Language ) {
  if (language === 'portuguese') return 'Você não está conectado à um canal temporário.';
  if (language === 'english') return 'You are not connected to a temporary channel';
  return 'You are not connected to a temporary channel';
}

export function simultaneousChannel(language: Language) {
  if (language === 'portuguese') return 'você só pode criar até \`\`2\`\` canais simultâneos.';
  if (language === 'english') return 'you can only create \`\`2\`\` simultaneous channels.';
  return 'you can only create \`\`2\`\` simultaneous channels.';
}

export function charactersLimitReached(language: Language, limit: number) {
  if (language === 'portuguese') return `O nome do canal não pode ultrapassar **${limit}** caractéres!`;
  if (language === 'english') return `The channel name can't reach **${limit}** characters!`;
  return `The name can't reach **${limit}** characters!`;
}

export function memberNotFound(language: Language) {
  if (language === 'portuguese') return 'Um dos usuários passados não foi encontrado. Certifique-se de que nenhum número ou letra aleatória foi passado junto ou caso tenha passado um ID, que o ID esteja correto.';
  if (language === 'english') return "One of the informed users wasn't found. Make sure that any number or random character wasn't sent or if you sent a ID, that the ID is correct.";
  return "One of the informed users wasn't found. Make sure that any number or random character was sent or if you sent a ID, that the ID is correct.";
}
