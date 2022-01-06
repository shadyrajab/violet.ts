import { Language } from '../../structures/structures/types';

export function punishHerself(language: Language) {
  if (language === 'portuguese') return 'Por que quer se punir do servidor? Está triste? Solitário? Desanimado? Eu te entendo... 😔 Não sou boa em dar conselhos, mas prometo te ouvir caso queira desabafar comigo no privado...';
  if (language === 'english') return 'Why do you want to punish yourself from the server? Are you sad? Alone? I understand you... 😔 I am not good at giving advice, but I promise listen you if you want to get something off from your chest...';
  return 'Why do you want to punish yourself from the server? Are you sad? Alone? I understand you... 😔 I am not good at giving advice, but I promise listen you if you want to get something off from your chest...';
}

export function punishClient(language: Language) {
  if (language === 'portuguese') return 'Olha só, que mal agradecido 😠! Tanto tempo trabalhando por essa gentalha e o que eu recebo? Uma ameaça de punição, ai ai...';
  if (language === 'english') return 'Look at this, your ingrate 😠! So long time working for that kids and what I receive? A punishment threat, ok ok...';
  return 'Look at this, your ingrate 😠! So long time working for that kids and what I receive? A punishment threat, ok ok...';
}

export function higherRole(language: Language) {
  if (language === 'portuguese') return 'Você não tem permissão para punir esse usuário pois seu cargo é inferior ou igual ao dele.';
  if (language === 'english') return "You don't have permission to punish this user because your role is lesser or equal than his.";
  return "You don't have permission to punish this user because your role is lesser or equal than his.";
}

export function lesserRole(language: Language) {
  if (language === 'portuguese') return 'Não tenho permissão para punir esse usuário pois seu cargo é superior ou igual ao meu.';
  if (language === 'english') return "I don't have permission to punish this user because his role is higher or equal than my.";
  return "I don't have permission to punish this user because his role is higher or equal than my.";
}

export function reasonn(language: Language) {
  if (language === 'portuguese') return '📄 Motivo';
  if (language === 'english') return '📄 Reason';
  return '📄 Reason';
}

export function time(language: Language) {
  if (language === 'portuguese') return '⏰ Tempo';
  if (language === 'english') return '⏰ Time';
  return '⏰ Time';
}

export function soIsThat(language: Language) {
  if (language === 'portuguese') return 'Então é isso? Não fique chateado :/. Vou te dar uma insígnia de presente, mas não conta pra ninguém, ok? Espero que isso te ajude a ficar melhor!';
  if (language === 'english') return "Is that so? Don't stay sad :/. I'll give you one badge as gift, but don't say that for anybody, ok? I hope it can help you to get better!";
  return "Is that so? Don't stay sad :/. I'll give you one badge as gift, but don't say that for anybody, ok? I hope it can help you to get better!";
}
