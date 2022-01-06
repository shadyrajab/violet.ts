import { Language } from '../../structures/structures/types';

export function serverOwner(language: Language) {
  if (language === 'portuguese') return '👑 Dono';
  if (language === 'english') return '👑 Owner';
  if (language === 'spanish') return '👑 Dueño';
  return '👑 Owner';
}

export function serverRegion(language: Language) {
  if (language === 'portuguese') return '🌎 Região';
  if (language === 'english') return '🌎 Region';
  if (language === 'spanish') return '🌎 Região';
  return '🌎 Region';
}

export function serverMembers(language: Language) {
  if (language === 'portuguese') return '👥 Membros';
  if (language === 'english') return '👥 Members';
  if (language === 'spanish') return '👥 Miembros';
  return '👥 Members';
}

export function creationDate(language: Language) {
  if (language === 'portuguese') return '📅 Criado em';
  if (language === 'english') return '📅 Created at';
  if (language === 'spanish') return '📅 Creado en';
  return '📅 Created at';
}

export function joiningDate(language: Language) {
  if (language === 'portuguese') return '🔔 Entrei aqui em';
  if (language === 'english') return '🔔 Joined here at';
  if (language === 'spanish') return '🔔 Ingresado aquí en';
  return '🔔 Joined here at';
}

export function mainRole(language: Language) {
  if (language === 'portuguese') return '💫 Cargo principal';
  if (language === 'english') return '💫 Main role';
  if (language === 'spanish') return '💫 Posición principal';
  return '💫 Main role';
}

export function secondaryRoles(language: Language) {
  if (language === 'portuguese') return '📜 Cargos secundários';
  if (language === 'english') return '📜 Secondary roles';
  if (language === 'spanish') return '📜 Posicíones secundarias';
  return '📜 Secondary roles';
}
