import { useState, useEffect, useMemo } from 'react';
import { Asset, Liability } from '@/types';
import assetsHistory from '@/data/static/assets-history.json';

interface UsePatrimonyFiltersProps {
  patrimonyData: {
    MY_ASSETS: Asset[];
    PARTNER_ASSETS: Asset[];
    MY_LIABILITIES: Liability[];
    PARTNER_LIABILITIES: Liability[];
  };
  ownerView: 'mine' | 'partner' | 'both';
  activeTab: 'assets' | 'liabilities';
  searchQuery: string;
  transformApiAssets: any[];
  transformApiDebts: any[];
  hasApiAssets: boolean;
  hasApiDebts: boolean;
  mapSavingInstrumentType: (type: string) => string;
  getLastTwoValues: (history: any[]) => { current: number | null; previous: number | null };
  calculateChange: (current: number, previous: number) => number;
}

export function usePatrimonyFilters({
  patrimonyData,
  ownerView,
  activeTab,
  searchQuery,
  transformApiAssets,
  transformApiDebts,
  hasApiAssets,
  hasApiDebts,
  mapSavingInstrumentType,
  getLastTwoValues,
  calculateChange,
}: UsePatrimonyFiltersProps) {
  const [visibleCount, setVisibleCount] = useState(5);
  const [isExpanded, setIsExpanded] = useState(false);

  // Reset pagination when tab changes
  useEffect(() => {
    setVisibleCount(5);
    setIsExpanded(false);
  }, [activeTab]);

  // Filter by owner view
  const myAssets = patrimonyData.MY_ASSETS;
  const partnerAssets = patrimonyData.PARTNER_ASSETS;
  const myLiabilities = patrimonyData.MY_LIABILITIES;
  const partnerLiabilities = patrimonyData.PARTNER_LIABILITIES;

  const combinedAssets = [...myAssets, ...partnerAssets];
  const combinedLiabilities = [...myLiabilities, ...partnerLiabilities];

  const currentAssets = ownerView === 'mine' ? myAssets : ownerView === 'partner' ? partnerAssets : combinedAssets;
  const currentLiabilities = ownerView === 'mine' ? myLiabilities : ownerView === 'partner' ? partnerLiabilities : combinedLiabilities;

  // Filter by search query (fallback data)
  const filteredAssets = currentAssets.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLiabilities = currentLiabilities.filter((l) =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Final data (API or fallback)
  const assetsData = useMemo(() => {
    if (hasApiAssets) {
      return transformApiAssets;
    }

    return filteredAssets.map(asset => {
      const history = assetsHistory[asset.id as keyof typeof assetsHistory] || [];
      const { current, previous } = getLastTwoValues(history);
      const change = (current !== null && previous !== null)
        ? calculateChange(current, previous)
        : asset.change;

      return {
        id: asset.id,
        title: asset.name,
        subtitle: mapSavingInstrumentType(asset.type),
        value: asset.value,
        icon: {
          backgroundColor: asset.color,
          text: asset.name.charAt(0)
        },
        badge: {
          text: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`,
          variant: change >= 0 ? 'positive' as const : 'negative' as const
        }
      };
    });
  }, [hasApiAssets, transformApiAssets, filteredAssets, mapSavingInstrumentType, getLastTwoValues, calculateChange]);

  const liabilitiesData = useMemo(() => {
    if (hasApiDebts) {
      return transformApiDebts;
    }

    return filteredLiabilities.map(liability => ({
      id: liability.id,
      title: liability.name,
      subtitle: liability.type,
      value: -liability.value,
      icon: {
        backgroundColor: liability.color,
        text: liability.name.charAt(0)
      },
      badge: {
        text: `${liability.change >= 0 ? '+' : ''}${liability.change}%`,
        variant: liability.change < 0 ? 'positive' as const : 'negative' as const
      }
    }));
  }, [hasApiDebts, transformApiDebts, filteredLiabilities]);

  // Current data based on active tab
  const currentData = activeTab === 'assets' ? assetsData : liabilitiesData;

  // Pagination
  const paginatedData = currentData.slice(0, visibleCount);
  const canShowMore = currentData.length > visibleCount;

  // Empty states
  const hasNoAssets = !hasApiAssets || (hasApiAssets && transformApiAssets.length === 0);
  const hasNoDebts = !hasApiDebts || (hasApiDebts && transformApiDebts.length === 0);
  const hasNoCurrentData = activeTab === 'assets' ? hasNoAssets : hasNoDebts;

  // Handlers
  const handleLoadMore = () => {
    const nextCount = Math.min(visibleCount + 5, currentData.length);
    setVisibleCount(nextCount);
    setIsExpanded(nextCount === currentData.length);
  };

  const handleLoadLess = () => {
    setVisibleCount(5);
    setIsExpanded(false);
  };

  const handleToggleExpand = () => {
    if (isExpanded) {
      handleLoadLess();
    } else {
      handleLoadMore();
    }
  };

  return {
    // State
    visibleCount,
    isExpanded,

    // Data
    assetsData,
    liabilitiesData,
    currentData,
    paginatedData,

    // Flags
    canShowMore,
    hasNoAssets,
    hasNoDebts,
    hasNoCurrentData,

    // Handlers
    handleLoadMore,
    handleLoadLess,
    handleToggleExpand,
  };
}
