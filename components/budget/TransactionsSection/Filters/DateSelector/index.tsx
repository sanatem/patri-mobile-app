import React from 'react';
import { View } from 'react-native';
import { Select } from '@/components/ui';
import { SkeletonBase } from '@/components/ui/SkeletonBase';

interface DateSelectorProps {
  monthOptions: Array<{ label: string; value: string }>;
  yearOptions: Array<{ label: string; value: string }>;
  selectedMonth: string;
  selectedYear: string;
  onMonthSelect: (value: string) => void;
  onYearSelect: (value: string) => void;
  isLoading: boolean;
  chartSize: number;
}

export function DateSelector({
  monthOptions,
  yearOptions,
  selectedMonth,
  selectedYear,
  onMonthSelect,
  onYearSelect,
  isLoading,
  chartSize
}: DateSelectorProps) {
  const halfWidth = (chartSize / 2) - 8;

  if (isLoading) {
    return (
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-1 mr-2">
          <SkeletonBase
            width={halfWidth}
            height={56}
            x={0}
            y={0}
            rows={1}
            rowHeight={56}
            rowWidth={halfWidth}
            borderRadius={16}
          />
        </View>
        <View className="flex-1 ml-2">
          <SkeletonBase
            width={halfWidth}
            height={56}
            x={0}
            y={0}
            rows={1}
            rowHeight={56}
            rowWidth={halfWidth}
            borderRadius={16}
          />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-row justify-between items-center mb-2">
      <View className="flex-1 mr-2">
        <Select
          options={monthOptions}
          value={selectedMonth}
          onSelect={onMonthSelect}
        />
      </View>
      <View className="flex-1 ml-2">
        <Select
          options={yearOptions}
          value={selectedYear}
          onSelect={onYearSelect}
        />
      </View>
    </View>
  );
}
