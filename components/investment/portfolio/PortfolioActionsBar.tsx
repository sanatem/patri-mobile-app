import React from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { portfolioActionsBarStyles } from '../../../styles/investment/PortfolioActionsBar.styles';

interface ActionButton {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost' | 'disabled';
  icon?: React.ReactElement | null | undefined;
  disabled?: boolean;
  fullWidth?: boolean;
}

interface PortfolioActionsBarProps {
  actions: ActionButton[];
  containerStyle?: any;
}

export function PortfolioActionsBar({ actions, containerStyle }: PortfolioActionsBarProps) {
  if (actions.length === 1 && actions[0].fullWidth) {
    return (
      <View style={[portfolioActionsBarStyles.container, containerStyle]}>
        <View style={portfolioActionsBarStyles.card}>
          <Button
            title={actions[0].title}
            onPress={actions[0].onPress}
            variant={actions[0].variant}
            icon={actions[0].icon}
            disabled={actions[0].disabled}
            fullWidth
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[portfolioActionsBarStyles.container, containerStyle]}>
      <View style={portfolioActionsBarStyles.card}>
        <View style={portfolioActionsBarStyles.buttonRow}>
          {actions.map((action, idx) => (
            <View style={portfolioActionsBarStyles.button} key={idx}>
              <Button
                title={action.title}
                onPress={action.onPress}
                variant={action.variant}
                icon={action.icon}
                disabled={action.disabled}
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
} 