import React from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { TrendingUp, Plus } from 'lucide-react-native';
import { portfolioActionsBarStyles } from '../../../styles/investment/PortfolioActionsBar.styles';
import Colors from '@/constants/Colors';

interface PortfolioActionsBarProps {
  onInvestPress: () => void;
  onCreatePress: () => void;
}

export function PortfolioActionsBar({ onInvestPress, onCreatePress }: PortfolioActionsBarProps) {
  return (
    <View style={portfolioActionsBarStyles.container}>
      <View style={portfolioActionsBarStyles.card}>
        <View style={portfolioActionsBarStyles.buttonRow}>
          <View style={portfolioActionsBarStyles.button}>
            <Button
              title="Invertir"
              onPress={onInvestPress}
              variant="primary"
              icon={<TrendingUp size={22} color="#fff" />}
            />
          </View>
          <View style={portfolioActionsBarStyles.button}>
            <Button
              title="Crear"
              onPress={onCreatePress}
              variant="outline"
              icon={<Plus size={22} color={Colors.gray[300]} />}
              disabled={true}
            />
          </View>
        </View>
      </View>
    </View>
  );
} 