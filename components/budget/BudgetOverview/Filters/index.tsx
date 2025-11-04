import React from 'react';
import { View } from 'react-native';
import { AccountSelector } from './AccountSelector';
import { DateSelector } from './DateSelector';

interface FiltersProps {
  accountOptions: Array<{ label: string; value: string }>;
  selectedAccountId: string;
  onAccountSelect: (value: string) => void;
  monthOptions: Array<{ label: string; value: string }>;
  yearOptions: Array<{ label: string; value: string }>;
  selectedMonth: string;
  selectedYear: string;
  onMonthSelect: (value: string) => void;
  onYearSelect: (value: string) => void;
  isLoading: boolean;
  chartSize: number;
  accountPlaceholder: string;
  noAccountsLabel: string;
}

export function Filters({
  accountOptions,
  selectedAccountId,
  onAccountSelect,
  monthOptions,
  yearOptions,
  selectedMonth,
  selectedYear,
  onMonthSelect,
  onYearSelect,
  isLoading,
  chartSize,
  accountPlaceholder,
  noAccountsLabel
}: FiltersProps) {
  return (
    <View>
      <View className="mb-2">
        <AccountSelector
          accountOptions={accountOptions}
          selectedAccountId={selectedAccountId}
          onSelect={onAccountSelect}
          placeholder={accountPlaceholder}
          noAccountsLabel={noAccountsLabel}
          isLoading={isLoading}
          chartSize={chartSize}
        />
      </View>

      <DateSelector
        monthOptions={monthOptions}
        yearOptions={yearOptions}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthSelect={onMonthSelect}
        onYearSelect={onYearSelect}
        isLoading={isLoading}
        chartSize={chartSize}
      />
    </View>
  );
}
