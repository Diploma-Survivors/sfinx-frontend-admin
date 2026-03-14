/**
 * Get currency symbol based on locale
 */
export function getCurrencySymbol(locale: string): string {
  if (locale === 'vi' || locale === 'vi-VN') {
    return '₫';
  }
  return '$';
}

/**
 * Get currency code based on locale
 */
export function getCurrencyCode(locale: string): string {
  if (locale === 'vi' || locale === 'vi-VN') {
    return 'VND';
  }
  return 'USD';
}

/**
 * Format number as currency based on locale
 */
export function formatCurrency(
  value: number,
  locale: string,
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  const currencySymbol = getCurrencySymbol(locale);
  const isVnd = locale === 'vi' || locale === 'vi-VN';

  const formatted = value.toLocaleString(
    isVnd ? 'vi-VN' : 'en-US',
    {
      minimumFractionDigits: options?.minimumFractionDigits ?? (isVnd ? 0 : 2),
      maximumFractionDigits: options?.maximumFractionDigits ?? (isVnd ? 0 : 2),
    }
  );

  return isVnd ? `${formatted} ${currencySymbol}` : `${currencySymbol}${formatted}`;
}

/**
 * Format number as currency with symbol for short display
 */
export function formatCurrencyShort(value: number, locale: string): string {
  const symbol = getCurrencySymbol(locale);
  const isVnd = locale === 'vi' || locale === 'vi-VN';

  if (isVnd) {
    // For VND, show in millions
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M ${symbol}`;
    }
    return `${Math.floor(value).toLocaleString('vi-VN')} ${symbol}`;
  }

  // For USD
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M ${symbol}`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K ${symbol}`;
  }
  return `${symbol}${value.toFixed(2)}`;
}
