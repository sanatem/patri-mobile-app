import React from 'react';
import BudgetChart from './BudgetChart';
import { ChartSkeleton } from '../Skeletons/ChartSkeleton';

interface BudgetChartSectionProps {
  selectedMonth: string;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  remainingBudget: number;
  isLoading: boolean;
  hasRealData: boolean;
  chartSize: number;
  shouldShowSkeletons: boolean;
}

export function BudgetChartSection({
  selectedMonth,
  totalIncome,
  totalExpenses,
  balance,
  remainingBudget,
  isLoading,
  hasRealData,
  chartSize,
  shouldShowSkeletons
}: BudgetChartSectionProps) {
  const hasDataForChart = hasRealData && (totalIncome > 0 || totalExpenses > 0);

  if (shouldShowSkeletons) {
    return <ChartSkeleton chartSize={chartSize} />;
  }

  return (
    <BudgetChart
      selectedMonth={selectedMonth}
      totalIncome={totalIncome}
      totalExpenses={totalExpenses}
      balance={balance}
      remainingBudget={remainingBudget}
      isLoading={isLoading}
      hasRealData={hasDataForChart}
    />
  );
}
