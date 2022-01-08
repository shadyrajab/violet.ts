import {Language} from '../../structures/structures/types';

export function newChannelError(language: Language) {
  if (language === 'portuguese') return 'Só é possível mover os usuários para um canal de voz!';
  if (language === 'english') return 'Is only possible to move the users to a voice channel!';
  return 'Is only possible to move the users to a voice channel!';
}

export function originalChannelError(language: Language) {
  if (language === 'portuguese') return 'Selecione um canal de voz ou uma categoria que contenha canais de voz.';
  if (language === 'english') return 'Select a voice channel or a category channel that have voice channels.';
  return 'Select a voice channel or a category channel that have voice channels.';
}
