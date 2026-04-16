import * as fs from 'node:fs';
import * as path from 'node:path';

export type TranslationMap = Record<string, Record<string, Record<string, unknown>>>;

/**
 * Flatten a nested object into sorted dot-separated leaf keys.
 */
export function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...flattenKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

/**
 * Compare all locale key sets against a reference locale.
 * Returns an array of human-readable error strings (empty = pass).
 */
export function compareLocales(translations: TranslationMap, referenceLang: string): string[] {
  const errors: string[] = [];
  const refNamespaces = translations[referenceLang];
  if (!refNamespaces) {
    return [`Reference locale "${referenceLang}" not found`];
  }

  for (const [lang, namespaces] of Object.entries(translations)) {
    if (lang === referenceLang) continue;

    for (const [ns, refObj] of Object.entries(refNamespaces)) {
      const targetObj = namespaces[ns];
      if (!targetObj) {
        errors.push(`[${lang}/${ns}] Entire namespace missing`);
        continue;
      }

      const refKeys = flattenKeys(refObj as Record<string, unknown>);
      const targetKeys = flattenKeys(targetObj as Record<string, unknown>);
      const refSet = new Set(refKeys);
      const targetSet = new Set(targetKeys);

      for (const key of refKeys) {
        if (!targetSet.has(key)) {
          errors.push(`[${lang}/${ns}] Missing key: "${key}"`);
        }
      }
      for (const key of targetKeys) {
        if (!refSet.has(key)) {
          errors.push(`[${lang}/${ns}] Extra key: "${key}"`);
        }
      }
    }
  }

  return errors;
}

/**
 * Load all locale JSON files from the i18n package.
 */
function loadTranslations(localesDir: string): TranslationMap {
  const translations: TranslationMap = {};

  for (const lang of fs.readdirSync(localesDir)) {
    const langDir = path.join(localesDir, lang);
    if (!fs.statSync(langDir).isDirectory()) continue;

    translations[lang] = {};
    for (const file of fs.readdirSync(langDir)) {
      if (!file.endsWith('.json')) continue;
      const ns = path.basename(file, '.json');
      const content = fs.readFileSync(path.join(langDir, file), 'utf-8');
      translations[lang][ns] = JSON.parse(content);
    }
  }

  return translations;
}

// CLI entry point — detect whether this file is being run directly (not imported by tests)
const isMain =
  typeof import.meta.url === 'string' &&
  process.argv[1] &&
  import.meta.url === `file://${path.resolve(process.argv[1])}`;

if (isMain) {
  const localesDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../packages/i18n/locales');

  if (!fs.existsSync(localesDir)) {
    console.error(`Locales directory not found: ${localesDir}`);
    process.exit(1);
  }

  const translations = loadTranslations(localesDir);
  const locales = Object.keys(translations).sort();
  console.log(`Checking translation parity: ${locales.join(', ')}`);

  const errors = compareLocales(translations, 'en');

  if (errors.length > 0) {
    console.error(`\n${errors.length} translation issue(s) found:\n`);
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  console.log('All translations are in sync.');
  process.exit(0);
}
