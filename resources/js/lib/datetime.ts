import { currentLocale } from './i18n';

const FALLBACK_TEXT = '—';

let timezone: string | null = null;

/**
 * Set the time zone used by the formatters below. Synced from the
 * authenticated user's stored time zone on every page visit. Guests
 * keep the browser-local time zone.
 */
export function setTimezone(nextTimezone: string | null | undefined): void {
    timezone = nextTimezone ?? null;
}

export function currentTimezone(): string | null {
    return timezone;
}

function toDate(value: string | number | Date | null | undefined): Date | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    const date = value instanceof Date ? value : new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
}

function timeZoneOption(): { timeZone: string } | undefined {
    return timezone ? { timeZone: timezone } : undefined;
}

/**
 * Format an instant (UTC from the server) as date + time in the user's
 * time zone, e.g. order timestamps.
 */
export function formatDateTime(
    value: string | number | Date | null | undefined,
): string {
    const date = toDate(value);

    if (!date) {
        return FALLBACK_TEXT;
    }

    return date.toLocaleString(currentLocale(), {
        ...timeZoneOption(),
    });
}

/**
 * Format an instant as a date in the user's time zone.
 */
export function formatDate(
    value: string | number | Date | null | undefined,
): string {
    const date = toDate(value);

    if (!date) {
        return FALLBACK_TEXT;
    }

    return date.toLocaleDateString(currentLocale(), {
        ...timeZoneOption(),
    });
}
