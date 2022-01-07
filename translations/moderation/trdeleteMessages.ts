import {Language} from '../../structures/structures/types';

export function notEnabled(language: Language) {
  if (language === 'portuguese') return 'O sistema de canais temporários não está ativado. Utilize o comando **/trsetup** para ativá-lo.';
  if (language === 'english') return 'The temporary channels system is not enable. Use the command **/trsetup** for enable it.';
  return 'The temporary channels system is not enable. Use the command **/trsetup** for enable it.';
}

export function pleaseSelect(language: Language) {
  if (language === 'portuguese') return 'Por favor, selecione apenas canais de voz!';
  if (language === 'english') return 'Please, select only voice channels!';
  return 'Please, select only voice channels!';
}
