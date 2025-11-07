import React from 'react';
import { View, Text } from 'react-native';
import { Tabs } from '@/components/ui';
import Colors from '@/constants/Colors';

interface TabsHeaderProps {
  tabs: Array<{ key: string; label: string; badge: string }>;
  activeTab: 'assets' | 'liabilities';
  onTabChange: (key: string) => void;
  totalLabel: string;
  totalAmount: number;
  amountPrefix: string;
}

export function TabsHeader({
  tabs,
  activeTab,
  onTabChange,
  totalLabel,
  totalAmount,
  amountPrefix
}: TabsHeaderProps) {
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
        <Text className="font-medium text-lg" style={{ color: Colors.gray[700] }}>
          {totalLabel}
        </Text>
        <Text className="font-medium text-lg" style={{ color: Colors.gray[700] }}>
          {amountPrefix}${totalAmount.toLocaleString('es-CL')}
        </Text>
      </View>
    </>
  );
}
