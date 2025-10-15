// lib/formatters.ts

// --- Generic Number Formatter ---
export function formatNumber(
  value: number | string,
  locale: string = "en-US"
): string {
  if (value === null || value === undefined || isNaN(Number(value))) return "";
  return new Intl.NumberFormat(locale).format(Number(value));
}

// --- Currency Formatter ---
type FormatCurrencyOptions = {
  locale?: string;      // e.g. "en-US", "en-PH"
  currency?: string;    // e.g. "USD", "PHP"
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  fromCents?: boolean;  // convert 1299 → 12.99
};

/**
 * Formats a number (or cents) into a localized currency string.
 * Example:
 *  formatCurrency(1299, { fromCents: true }) => "$12.99"
 *  formatCurrency(1000, { locale: "en-PH", currency: "PHP" }) => "₱1,000.00"
 */
export function formatCurrency(
  value: number | string,
  options: FormatCurrencyOptions = {}
): string {
  const {
    locale = "en-US",
    currency = "USD",
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    fromCents = false,
  } = options;

  if (value === null || value === undefined || isNaN(Number(value))) return "";

  const numericValue = fromCents ? Number(value) / 100 : Number(value);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(numericValue);
}
