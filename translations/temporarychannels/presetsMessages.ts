import { Language } from '../../structures/structures/types';

export function notFound(language: Language) {
  if (language === 'portuguese') return 'Você ainda não possui um perfil de configuração padrão de salas temporárias para esse servidor. Para criar um, clique na reação abaixo:';
  if (language === 'english') return "You still don't have a configuration profile of default temporary channels for this server. To create one, click on reaction below:";
  return "You still don't have a configuration profile of default temporary channels for this server. To create one, click on reaction below:";
}

export function created(language: Language) {
  if (language === 'portuguese') return 'Seu perfil de configuração foi criado com sucesso. Utilize o comando novamente para poder configurá-lo.';
  if (language === 'english') return 'Your configuration profile was created succesfully. Use the command again to configure it.';
  return 'Your configuration profile was created succesfully. Use the command again to configure it.';
}

export function limitReached(language: Language) {
  if (language === 'portuguese') return 'Você já atingiu o limite de 2 predefinições por usuário. Delete um dos perfis para criar um outro.';
  if (language === 'english') return 'You already reached the limit of 2 presets by user. Delete one of the profiles to create other.';
  return 'You already reached the limit of 2 presets by user. Delete one of the profiles to create other.';
}

export function embedTitle(language: Language) {
  if (language === 'portuguese') return 'Configuração padrão de canais temporários';
  if (language === 'english') return 'Default temporary channels configuration';
  return 'Default temporary channels configuration';
}

export function embedChannelName(language: Language) {
  if (language === 'portuguese') return '📄 Nome dos canais';
  if (language === 'english') return '📄 Channels name';
  return '📄 Channels name';
}

export function embedLock(language: Language) {
  if (language === 'portuguese') return '🔒 Sala trancada';
  if (language === 'english') return '🔒 Channel locked';
  return '🔒 Channel locked';
}

export function embedHide(language: Language) {
  if (language === 'portuguese') return '🔗 Sala invisível';
  if (language === 'english') return '🔗 Channel hided';
  return '🔗 Channel hided';
}

export function embedMembers(language: Language) {
  if (language === 'portuguese') return '👥 Membros adicionados';
  if (language === 'english') return '👥 Members added';
  return '👥 Members added';
}

export function embedAdmins(language: Language) {
  if (language === 'portuguese') return '👑 Administradores';
  if (language === 'english') return '👑 Administrators';
  return '👑 Administrators';
}

export function embedBlocks(language: Language) {
  if (language === 'portuguese') return '❌ Membros bloqueados';
  if (language === 'english') return '❌ Members blocked';
  return '❌ Members blocked';
}

export function embedDelete(language: Language) {
  if (language === 'portuguese') return 'Para deletar suas predefinições de canais, clique em \u200B 🚫';
  if (language === 'english') return 'To delete your channels presets, click on \u200B 🚫';
  return 'To delete your channels presets, click on \u200B 🚫';
}

export function embedObs(language: Language) {
  if (language === 'portuguese') return 'Essas configurações serão setadas automaticamente sempre que\nvocê criar uma nova sala temporária neste servidor.';
  if (language === 'english') return 'That settings will be seted automatically always you create a\nnew temporary channel in this server.';
  return 'That settings will be seted automatically always you create a\nnew temporary channel in this server.';
}

export function whatName(language: Language) {
  if (language === 'portuguese') return 'Qual será o nome das suas salas?';
  if (language === 'english') return 'What will be the name of your channels?';
  return 'What will be the name of your channels?';
}

export function deleted(language: Language) {
  if (language === 'portuguese') return 'Suas predefinições de salas temporárias foram deletadas.';
  if (language === 'english') return 'Your temporary channels presets was deleted.';
  return 'Your temporary channels presets was deleted.';
}

export function willBeLocked(language: Language) {
  if (language === 'portuguese') return 'Suas salas temporárias agora serão trancadas automaticamente.';
  if (language === 'english') return 'Now your temporary channels will be locked automatically.';
  return 'Now your temporary channels will be locked automatically.';
}

export function willBeHided(language: Language) {
  if (language === 'portuguese') return 'Suas salas temporárias agora terão sua visibilidade removida automaticamente.';
  if (language === 'english') return 'Now your temporary channels will be hided automatically.';
  return 'Now your temporary channels will be hided automatically.';
}

export function removeOrAdd(language: Language) {
  if (language === 'portuguese') return 'Clique em ✅ para adicionar membros ou em ❌ para remover.';
  if (language === 'english') return 'Click on ✅ to add a member or on ❌ to remove.';
  return 'Click on ✅ to add a member or on ❌ to remove.';
}

export function addMember(language: Language) {
  if (language === 'portuguese') return 'Quem você deseja adicionar às suas salas temporárias? Marque ou informe o ID do usuário ou cargo.';
  if (language === 'english') return 'Who do you want to add to your temporary channels? Ping the user or send the user ID or role.';
  return 'Who do you want to add to your temporary channels? Ping the user or role or send the ID.';
}

export function removeMember(language: Language) {
  if (language === 'portuguese') return 'Quem você deseja remover das suas salas temporárias? Marque ou informe o ID do usuário ou cargo.';
  if (language === 'english') return 'Who do you want to remove from your temporary channels? Ping the user or send the user ID or role.';
  return 'Who do you want to remove from your temporary channels? Ping the user or role or send the ID.';
}
