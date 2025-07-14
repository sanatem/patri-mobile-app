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
  