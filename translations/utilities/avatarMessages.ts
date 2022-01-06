import { Language } from '../../structures/structures/types';

export function doYouKnowDani(language: Language) {
  if (language === 'portuguese') return 'Oi gata, você conhece a Dani?';
  if (language === 'english') return 'Hello kitty, do you know Dani?';
  return 'Hello kitty, do you know Dani?';
}

export function whatDani(language: Language) {
  if (language === 'portuguese') return 'Que Dani?';
  if (language === 'english') return 'What Dani?';
  return 'What Dani?';
}

export function thatDani(language: Language) {
  if (language === 'portuguese') return 'A danificada que você deu no meu coração, sua linda, te amo <3';
  if (language === 'english') return 'The "danification" you cause in my heart, your pretty, I love you <3';
  return 'The "danification" you cause in my heart, your pretty, I love you <3';
}
