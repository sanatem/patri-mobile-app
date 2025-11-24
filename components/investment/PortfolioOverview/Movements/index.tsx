import React from 'react';
import { View } from 'react-native';
import { ArrowDown, ArrowUp } from 'lucide-react-native';
import { PortfolioActionsBar } from './PortfolioActionsBar';
import Colors from '@/constants/Colors';

interface PortfolioMovementsProps {
  onInvestPress: () => void;
  onWithdrawPress: () => void;
  t: (key: string) => string;
}

export function PortfolioMovements({ onInvestPress, onWithdrawPress, t }: PortfolioMovementsProps) {
  return (
    <View className="px-5 pb-1 pt-1 bg-white">
      <PortfolioActionsBar
        actions={[
          {
            title: t('portfolio.actions.withdraw'),
            onPress: onWithdrawPress,
            icon: <ArrowUp size={20} color={Colors.secondary[500]} />,
            variant: 'outline'
          },
          {
            title: t('portfolio.actions.invest'),
            onPress: onInvestPress,
            icon: <ArrowDown size={20} color={Colors.primary[500]} />,
            variant: 'primary'
          }
        ]}
      />
    </View>
  );
}
