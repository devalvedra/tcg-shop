export const DEFAULT_STORE_NAME = 'TCG Shop';

export type StoreBranding = {
    hasLogo: boolean;
    hasName: boolean;
    showIcon: boolean;
    showText: boolean;
    text: string;
};

export function resolveBranding(
    name: string | null | undefined,
    logo: string | null | undefined,
): StoreBranding {
    const text = (name ?? '').trim();
    const hasName = text !== '';
    const hasLogo = Boolean(logo);

    return {
        hasLogo,
        hasName,
        showIcon: !hasLogo,
        showText: hasName || !hasLogo,
        text: hasName ? text : DEFAULT_STORE_NAME,
    };
}
