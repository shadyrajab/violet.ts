import { translations } from './locales';
import { Locale, DEFAULT_LOCALE, DISCORD_LOCALE_MAP, TranslationSchema, SUPPORTED_LOCALES } from './types';

export * from './types';

type PathKeys<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? PathKeys<T[K], `${Prefix}${K}.`>
          : `${Prefix}${K}`
        : never;
    }[keyof T]
  : never;

type TranslationKey = PathKeys<TranslationSchema>;

function getNestedValue<T>(obj: T, path: string): string {
  const keys = path.split('.');
  let result: unknown = obj;

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }

  return typeof result === 'string' ? result : path;
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;

  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return params[key]?.toString() ?? `{${key}}`;
  });
}

class I18n {
  private locale: Locale = DEFAULT_LOCALE;

  setLocale(locale: Locale): void {
    this.locale = locale;
  }

  getLocale(): Locale {
    return this.locale;
  }

  resolveLocale(discordLocale: string | null | undefined): Locale {
    if (!discordLocale) return DEFAULT_LOCALE;
    return DISCORD_LOCALE_MAP[discordLocale] ?? DEFAULT_LOCALE;
  }

  isSupported(locale: string): locale is Locale {
    return SUPPORTED_LOCALES.includes(locale as Locale);
  }

  t<K extends TranslationKey>(
    key: K,
    params?: Record<string, string | number>,
    locale?: Locale
  ): string {
    const targetLocale = locale ?? this.locale;
    const translation = translations[targetLocale] ?? translations[DEFAULT_LOCALE];

    const value = getNestedValue(translation, key);
    return interpolate(value, params);
  }

  getTranslations(locale?: Locale): TranslationSchema {
    const targetLocale = locale ?? this.locale;
    return translations[targetLocale] ?? translations[DEFAULT_LOCALE];
  }
}

export const i18n = new I18n();

export function t<K extends TranslationKey>(
  key: K,
  params?: Record<string, string | number>,
  locale?: Locale
): string {
  return i18n.t(key, params, locale);
}

export function resolveLocale(discordLocale: string | null | undefined): Locale {
  return i18n.resolveLocale(discordLocale);
}
