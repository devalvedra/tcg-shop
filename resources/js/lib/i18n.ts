let locale: string = 'en';

let translations: Record<string, string> = {};

export function setI18n(
    nextLocale: string,
    nextTranslations: Record<string, string>,
): void {
    locale = nextLocale;
    translations = nextTranslations;
}

export function t(
    key: string,
    params?: Record<string, string | number>,
): string {
    let translated = key;

    if (locale !== 'en') {
        translated = translations[key] ?? key;
    }

    if (params) {
        for (const [name, value] of Object.entries(params)) {
            translated = translated.replaceAll(`{${name}}`, String(value));
        }
    }

    return translated;
}

export function currentLocale(): string {
    return locale;
}
