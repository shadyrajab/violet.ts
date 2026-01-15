import { TranslationSchema } from '../types';
import { en } from './en';
import { pt } from './pt';
import { es } from './es';
import { fr } from './fr';
import { it } from './it';
import { de } from './de';
import { pl } from './pl';

export const translations: Record<string, TranslationSchema> = {
  en,
  pt,
  es,
  fr,
  it,
  de,
  pl
};
