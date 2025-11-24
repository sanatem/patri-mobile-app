import React from 'react';
import { PatrimonySummary } from '@/components/patrimony/PatrimonyOverview/Summary/PatrimonySummary';

interface SummarySectionProps {
  totalNetWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  variation: number;
  variationPercentage: number;
  currentView: 'mine' | 'partner' | 'both';
}

export function SummarySection({
  totalNetWorth,
  totalAssets,
  totalLiabilities,
  variation,
  variationPercentage,
  currentView
}: SummarySectionProps) {
  return (
    <PatrimonySummary
      totalNetWorth={totalNetWorth}
      totalAssets={totalAssets}
      totalLiabilities={totalLiabilities}
      variation={variation}
      variationPercentage={variationPercentage}
      currentView={currentView}
    />
  );
}
