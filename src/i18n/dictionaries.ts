import type { Locale } from './config';
import { defaultLocale } from './config';
import en from './en.json';
import fr from './fr.json';

const dictionaries = { en, fr } as const;

export type Dictionary = typeof en;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

/**
 * Get a nested translation value with dot notation
 * Falls back to English if key not found in target locale
 */
export function t(dict: Dictionary, key: string): string {
  const keys = key.split('.');
  let value: unknown = dict;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      // Fallback to English
      value = en;
      for (const fk of keys) {
        if (value && typeof value === 'object' && fk in value) {
          value = (value as Record<string, unknown>)[fk];
        } else {
          return key; // Return key if not found
        }
      }
      break;
    }
  }

  return typeof value === 'string' ? value : key;
}

/**
 * Type-safe translation hook helper
 */
export function createT(dict: Dictionary) {
  return (key: string) => t(dict, key);
}
