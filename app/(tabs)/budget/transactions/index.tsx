import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { TransactionsOverview } from '@/components/budget/TransactionsSection';

export default function TransactionsScreen() {
  const { accountId } = useLocalSearchParams<{ accountId?: string }>();

  return <TransactionsOverview initialAccountId={accountId} />;
}
