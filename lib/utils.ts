export function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatAssetResponse<T extends { commercial_value?: number; total_amount?: number }>(
  asset: T
): T {
  const formattedAsset = { ...asset };
  
  if ('commercial_value' in asset && typeof asset.commercial_value === 'number') {
    formattedAsset.commercial_value = Math.round(asset.commercial_value);
  }
  
  if ('total_amount' in asset && typeof asset.total_amount === 'number') {
    formattedAsset.total_amount = Math.round(asset.total_amount);
  }
  
  return formattedAsset;
}

interface AssetTotals {
  total_assets: number;
  fixed_assets_total: number;
  saving_instruments_total: number;
  investment_properties_total: number;
  main_homes_total: number;
}

export function formatTotals(totals: AssetTotals): AssetTotals {
  return {
    total_assets: Math.round(totals.total_assets),
    fixed_assets_total: Math.round(totals.fixed_assets_total),
    saving_instruments_total: Math.round(totals.saving_instruments_total),
    investment_properties_total: Math.round(totals.investment_properties_total),
    main_homes_total: Math.round(totals.main_homes_total),
  };
}

export function safeCurrencyToNumber(value: any, defaultValue: number = 0): number {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  
  if (value === null || value === undefined) {
    return defaultValue;
  }
  
  if (typeof value === 'string') {
    const cleanValue = value.replace(/[^\d.,-]/g, '');
    if (cleanValue && !isNaN(Number(cleanValue))) {
      return Number(cleanValue);
    }
  }
  
  if (typeof value === 'object' && value !== null && typeof value.currency_to_number === 'function') {
    try {
      return value.currency_to_number();
    } catch (error) {
      console.warn('Error calling currency_to_number:', error);
      return defaultValue;
    }
  }
  
  if (typeof value === 'object' && value !== null) {
    const possibleValueProps = ['value', 'amount', 'number', 'quantity', 'total', 'price', 'cost'];
    for (const prop of possibleValueProps) {
      if (value[prop] !== undefined && !isNaN(Number(value[prop]))) {
        return Number(value[prop]);
      }
    }
  }
  
  return defaultValue;
}

export function formatCurrencyValue(value: any, currency: string = 'CLP', locale: string = 'es-CL'): string {
  const numericValue = safeCurrencyToNumber(value, 0);
  
  if (numericValue === 0) {
    return `$0 ${currency}`;
  }
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericValue);
  } catch (error) {
    return `$${Math.abs(numericValue).toLocaleString(locale)} ${currency}`;
  }
}
  