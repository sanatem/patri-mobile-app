import React from 'react';
import { View, Text } from 'react-native';
import { Tabs } from '@/components/ui';
import Colors from '@/constants/Colors';

interface BudgetTabProps {
  tabs: Array<{ key: string; label: string; badge: string }>;
  activeTab: 'income' | 'expenses';
  onTabChange: (key: string) => void;
  totalLabel: string;
  totalAmount: number;
  amountPrefix: string;
}

export function BudgetTab({
  tabs,
  activeTab,
  onTabChange,
  totalLabel,
  totalAmount,
  amountPrefix
}: BudgetTabProps) {
  return (
    <>
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray[200]
      }}>
        <Text className="text-lg font-medium" style={{ color: Colors.gray[700] }}>
          {totalLabel}
        </Text>
        <Text className="text-lg font-medium" style={{ color: Colors.gray[700] }}>
          {amountPrefix}${Math.round(totalAmount).toLocaleString('es-CL')}
        </Text>
      </View>
    </>
  );
}
