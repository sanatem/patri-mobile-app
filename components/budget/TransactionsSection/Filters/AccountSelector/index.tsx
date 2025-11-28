import React from 'react';
import { View } from 'react-native';
import { Select } from '@/components/ui';
import { SkeletonBase } from '@/components/ui/SkeletonBase';

interface AccountSelectorProps {
  accountOptions: Array<{ label: string; value: string }>;
  selectedAccountId: string;
  onSelect: (value: string) => void;
  placeholder: string;
  noAccountsLabel: string;
  isLoading: boolean;
  chartSize: number;
}

export function AccountSelector({
  accountOptions,
  selectedAccountId,
  onSelect,
  placeholder,
  noAccountsLabel,
  isLoading,
  chartSize
}: AccountSelectorProps) {
  if (isLoading) {
    return (
      <SkeletonBase
        width={chartSize}
        height={56}
        x={0}
        y={0}
        rows={1}
        rowHeight={56}
        rowWidth={chartSize}
        borderRadius={16}
      />
    );
  }

  return (
    <Select
      options={accountOptions.length > 0 ? accountOptions : [{ label: noAccountsLabel, value: 'none' }]}
      value={selectedAccountId}
      onSelect={onSelect}
      placeholder={placeholder}
      disabled={accountOptions.length === 0}
    />
  );
}
