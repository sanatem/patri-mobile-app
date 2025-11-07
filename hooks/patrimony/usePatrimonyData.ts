import { useMemo } from 'react';
import { useAssets, useDebts } from '@/hooks/patrimony';
import assetsHistory from '@/data/static/assets-history.json';

export function usePatrimonyData(searchQuery: string) {
  const { assets: apiAssets, loading: assetsLoading, error: assetsError, refetch: refetchAssets } = useAssets({
    page: 1,
    per_page: 100
  }, true);

  const { debts: apiDebts, loading: debtsLoading, error: debtsError, refetch: refetchDebts } = useDebts({
    page: 1,
    per_page: 100
  }, true);

  // Helper functions
  const mapSavingInstrumentType = (type: string): string => {
    const typeMapping: Record<string, string> = {
      'SavingInstruments::Crowdfunding': 'Crowdfunding',
      'SavingInstruments::MutualFundInstrument': 'Fondo Mutuo o de Inversión',
      'SavingInstruments::Cryptocurrency': 'Criptomonedas',
      'SavingInstruments::AfpAccountTwo': 'Cuenta 2 AFP',
      'SavingInstruments::ApvAccount': 'Cuenta APV',
      'SavingInstruments::CashAccount': 'Cuenta Caja',
      'SavingInstruments::CheckingAccount': 'Cuenta Corriente',
      'SavingInstruments::SavingAccount': 'Cuenta de Ahorros',
      'SavingInstruments::FixedTermDeposit': 'Depósito a Plazo',
      'SavingInstruments::Share': 'Acciones',
      'SavingInstruments::Other': 'Otros',
      'SavingInstruments::SavingsAccount': 'Cuenta de Ahorros',
      'SavingInstruments::InvestmentFund': 'Fondo de Inversión',
      'SavingInstruments::OtherSavingInstrument': 'Otros',
    };

    return typeMapping[type] || type.replace('SavingInstruments::', '');
  };

  const getSavingInstrumentIcon = (type: string, name: string) => {
    const iconMapping: Record<string, { backgroundColor: string; text: string }> = {
      'SavingInstruments::CashAccount': { backgroundColor: '#10B981', text: '$' },
      'SavingInstruments::FixedTermDeposit': { backgroundColor: '#3B82F6', text: 'D' },
      'SavingInstruments::SavingsAccount': { backgroundColor: '#8B5CF6', text: 'A' },
      'SavingInstruments::CheckingAccount': { backgroundColor: '#F59E0B', text: 'C' },
      'SavingInstruments::MutualFund': { backgroundColor: '#EF4444', text: 'F' },
      'SavingInstruments::Stock': { backgroundColor: '#06B6D4', text: 'S' },
      'SavingInstruments::InvestmentFund': { backgroundColor: '#06B6D4', text: 'I' },
      'SavingInstruments::Crowdfunding': { backgroundColor: '#F97316', text: 'C' },
      'SavingInstruments::MutualFundInstrument': { backgroundColor: '#EF4444', text: 'M' },
      'SavingInstruments::Cryptocurrency': { backgroundColor: '#FBBF24', text: '₿' },
      'SavingInstruments::AfpAccountTwo': { backgroundColor: '#6366F1', text: '2' },
      'SavingInstruments::ApvAccount': { backgroundColor: '#8B5CF6', text: 'A' },
      'SavingInstruments::SavingAccount': { backgroundColor: '#10B981', text: 'S' },
      'SavingInstruments::Shares': { backgroundColor: '#06B6D4', text: '$' },
      'SavingInstruments::Other': { backgroundColor: '#6B7280', text: '?' },
    };

    return iconMapping[type] || {
      backgroundColor: '#EA4335',
      text: name.charAt(0)
    };
  };

  const getDebtTypeFromCategory = (categoryName: string): string => {
    const nameMap: Record<string, string> = {
      'automotriz': 'automotive_credit',
      'caja de compensación': 'consumer_credit',
      'consumo': 'consumer_credit',
      'crédito universitario': 'commercial_credit',
      'hipotecario de uso': 'mortgage_credit',
      'hipotecario de inversión': 'mortgage',
      'línea de crédito': 'credit_line',
      'préstamos familiares o amigos': 'family_loan',
      'tarjeta de crédito': 'credit_card'
    };
    return nameMap[categoryName?.toLowerCase()] || 'other';
  };

  const getLastTwoValues = (history: { date: string, value: number }[]) => {
    if (history.length < 2) return { current: null, previous: null };
    const sorted = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return {
      previous: sorted[sorted.length - 2].value,
      current: sorted[sorted.length - 1].value
    };
  };

  const calculateChange = (current: number, previous: number) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Data transformation
  const transformApiAssets = useMemo(() => {
    if (!apiAssets) return [];

    const allAssets = [
      ...apiAssets.assets.fixed_assets.map(asset => ({
        id: asset.id.toString(),
        title: asset.name,
        subtitle: asset.category,
        value: Math.round(asset.commercial_value),
        icon: {
          backgroundColor: '#4285F4',
          text: asset.name.charAt(0)
        },
        badge: {
          text: '0.00%',
          variant: 'positive' as const
        },
        type: 'fixed_asset',
        rawData: asset
      })),

      ...apiAssets.assets.saving_instruments.map(asset => {
        const icon = getSavingInstrumentIcon(asset.type, asset.name);

        return {
          id: asset.id.toString(),
          title: asset.name,
          subtitle: mapSavingInstrumentType(asset.type),
          value: Math.round(asset.total_amount),
          icon,
          badge: {
            text: '0.00%',
            variant: 'positive' as const
          },
          type: 'saving_instrument',
          rawData: asset
        };
      }),

      ...apiAssets.assets.investment_properties.map(asset => ({
        id: asset.id.toString(),
        title: `Propiedad ${asset.location}`,
        subtitle: asset.square_mts
          ? `${asset.square_mts}m² - ${asset.number_of_bedrooms || 0} hab`
          : 'Propiedad de inversión',
        value: Math.round(asset.commercial_value),
        icon: {
          backgroundColor: '#FBBC05',
          text: 'P'
        },
        badge: {
          text: '0.00%',
          variant: 'positive' as const
        },
        type: 'investment_property',
        rawData: { ...asset, property_type: 'rent' }
      })),

      ...apiAssets.assets.main_homes.map(asset => ({
        id: asset.id.toString(),
        title: `Casa ${asset.location}`,
        subtitle: asset.square_mts
          ? `${asset.square_mts}m² - ${asset.number_of_bedrooms || 0} hab`
          : asset.kind === 'leased' ? 'Casa arrendada' : 'Casa propia',
        value: Math.round(asset.commercial_value),
        icon: {
          backgroundColor: '#6366F1',
          text: 'C'
        },
        badge: {
          text: '0.00%',
          variant: 'positive' as const
        },
        type: 'main_home',
        rawData: { ...asset, property_type: 'own' }
      }))
    ];

    return allAssets.filter(asset =>
      asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [apiAssets, searchQuery]);

  const transformApiDebts = useMemo(() => {
    if (!apiDebts) return [];

    return apiDebts.debts.map(debt => ({
      id: debt.id.toString(),
      title: debt.name,
      subtitle: debt.debt_category,
      value: -Math.round(debt.amount),
      icon: {
        backgroundColor: '#DC2626',
        text: debt.name.charAt(0)
      },
      badge: {
        text: `${debt.cae_percentage}% CAE`,
        variant: 'negative' as const
      },
      type: getDebtTypeFromCategory(debt.debt_category),
      rawData: debt
    })).filter(debt =>
      debt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      debt.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [apiDebts, searchQuery]);

  // Computed totals
  const totalAssets = apiAssets ? Math.round(apiAssets.totals.total_assets) : 0;
  const totalLiabilities = apiDebts ? Math.round(apiDebts.totals.total_debts) : 0;
  const netWorth = totalAssets - totalLiabilities;

  const hasApiAssets = apiAssets !== null && apiAssets !== undefined;
  const hasApiDebts = apiDebts !== null && apiDebts !== undefined;

  return {
    // Raw API data
    apiAssets,
    apiDebts,

    // Transformed data
    transformApiAssets,
    transformApiDebts,

    // Totals
    totalAssets,
    totalLiabilities,
    netWorth,

    // Loading states
    assetsLoading,
    debtsLoading,

    // Errors
    assetsError,
    debtsError,

    // Flags
    hasApiAssets,
    hasApiDebts,

    // Refetch functions
    refetchAssets,
    refetchDebts,

    // Helper functions (for backward compatibility)
    mapSavingInstrumentType,
    getLastTwoValues,
    calculateChange,
  };
}
