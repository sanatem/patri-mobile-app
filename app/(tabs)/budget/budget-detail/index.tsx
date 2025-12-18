import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { BudgetDetail } from '@/components/budget/BudgetDetail';

export default function BudgetDetailScreen() {
  const { instanceId } = useLocalSearchParams<{ instanceId: string }>();

  return <BudgetDetail instanceId={instanceId || ''} />;
}
