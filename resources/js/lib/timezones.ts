export type TimezoneOption = {
    value: string;
    label: string;
};

export const DEFAULT_TIMEZONE = 'Asia/Jakarta';

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
    { value: 'UTC', label: '(GMT+00:00) UTC' },
    { value: 'Pacific/Midway', label: '(GMT-11:00) Midway' },
    { value: 'Pacific/Honolulu', label: '(GMT-10:00) Honolulu' },
    { value: 'America/Anchorage', label: '(GMT-09:00) Anchorage' },
    { value: 'America/Los_Angeles', label: '(GMT-08:00) Los Angeles' },
    { value: 'America/Denver', label: '(GMT-07:00) Denver' },
    { value: 'America/Chicago', label: '(GMT-06:00) Chicago' },
    { value: 'America/New_York', label: '(GMT-05:00) New York' },
    { value: 'America/Halifax', label: '(GMT-04:00) Halifax' },
    { value: 'America/St_Johns', label: '(GMT-03:30) St. Johns' },
    { value: 'America/Sao_Paulo', label: '(GMT-03:00) Sao Paulo' },
    { value: 'Atlantic/Azores', label: '(GMT-01:00) Azores' },
    { value: 'Europe/London', label: '(GMT+00:00) London' },
    { value: 'Europe/Berlin', label: '(GMT+01:00) Berlin' },
    { value: 'Europe/Athens', label: '(GMT+02:00) Athens' },
    { value: 'Europe/Moscow', label: '(GMT+03:00) Moscow' },
    { value: 'Asia/Dubai', label: '(GMT+04:00) Dubai' },
    { value: 'Asia/Karachi', label: '(GMT+05:00) Karachi' },
    { value: 'Asia/Kathmandu', label: '(GMT+05:45) Kathmandu' },
    { value: 'Asia/Dhaka', label: '(GMT+06:00) Dhaka' },
    { value: 'Asia/Bangkok', label: '(GMT+07:00) Bangkok' },
    { value: 'Asia/Jakarta', label: '(GMT+07:00) Jakarta' },
    { value: 'Asia/Shanghai', label: '(GMT+08:00) Shanghai' },
    { value: 'Asia/Singapore', label: '(GMT+08:00) Singapore' },
    { value: 'Asia/Manila', label: '(GMT+08:00) Manila' },
    { value: 'Asia/Makassar', label: '(GMT+08:00) Makassar' },
    { value: 'Australia/Perth', label: '(GMT+08:00) Perth' },
    { value: 'Asia/Tokyo', label: '(GMT+09:00) Tokyo' },
    { value: 'Asia/Jayapura', label: '(GMT+09:00) Jayapura' },
    { value: 'Australia/Adelaide', label: '(GMT+09:30) Adelaide' },
    { value: 'Australia/Sydney', label: '(GMT+10:00) Sydney' },
    { value: 'Pacific/Auckland', label: '(GMT+12:00) Auckland' },
];

/**
 * Options for the time zone selects. When the user currently has a time
 * zone outside the curated list it is prepended so their value stays
 * selectable instead of silently resetting.
 */
export function timezoneOptionsFor(
    current: string | null | undefined,
): TimezoneOption[] {
    if (
        !current ||
        TIMEZONE_OPTIONS.some((option) => option.value === current)
    ) {
        return TIMEZONE_OPTIONS;
    }

    return [{ value: current, label: current }, ...TIMEZONE_OPTIONS];
}
