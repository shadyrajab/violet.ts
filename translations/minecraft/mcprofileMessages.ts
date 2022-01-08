import {Language} from '../../structures/structures/types';

export function minecraftProfile(language: Language) {
  if (language === 'portuguese') return 'Perfil no Minecraft';
  if (language === 'english') return 'Minecraft\'s Profile';
  return 'Minecraft\'s Profile';
}

export function historyName(language: Language) {
  if (language === 'portuguese') return 'Histórico de nomes';
  if (language === 'english') return 'Name history';
  return 'Name history';
}

export function headCommand(language: Language) {
  if (language === 'portuguese') return 'Comando para obter a cabeça';
  if (language === 'english') return 'Command to get the head';
  return 'Command to get the head';
}
