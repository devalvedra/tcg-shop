let currency: string = 'usd';

const currencyConfig: Record<
    string,
    { locale: string; currency: string; symbol: string; fractionDigits: number }
> = {
    usd: { locale: 'en-US', currency: 'USD', symbol: '$', fractionDigits: 2 },
    idr: { locale: 'id-ID', currency: 'IDR', symbol: 'Rp', fractionDigits: 0 },
};

export function setCurrency(nextCurrency: string): void {
    currency = nextCurrency;
}

export function currentCurrency(): string {
    return currency;
}

export function currencySymbol(): string {
    return (currencyConfig[currency] ?? currencyConfig.usd).symbol;
}

export function formatCurrency(value: string | number): string {
    const config = currencyConfig[currency] ?? currencyConfig.usd;

    return new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: config.currency,
        minimumFractionDigits: config.fractionDigits,
        maximumFractionDigits: config.fractionDigits,
    }).format(Number(value));
}
