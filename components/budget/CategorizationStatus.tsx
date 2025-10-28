import React from 'react';
import { View, Text } from 'react-native';
import { AlertTriangle, Bot, CheckCircle } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { CategorizationStatus as StatusType } from '@/services/budget/get-floid-transactions';
import { useTranslation } from 'react-i18next';

interface CategorizationStatusProps {
  status: StatusType;
}

export function CategorizationStatus({ status }: CategorizationStatusProps) {
  const { t } = useTranslation();

  const getStatusConfig = () => {
    switch (status) {
      case 'uncategorized':
        return {
          IconComponent: AlertTriangle,
          label: t('budget.categorization.uncategorized', 'Sin categorizar'),
          color: Colors.warning[500],
          backgroundColor: 'white',
          borderColor: Colors.warning[500],
        };
      case 'automatic':
        return {
          IconComponent: Bot,
          label: t('budget.categorization.automatic', 'Automática'),
          color: Colors.navy[500],
          backgroundColor: 'white',
          borderColor: Colors.navy[500],
        };

      case 'manual':
        return {
          IconComponent: CheckCircle,
          label: t('budget.categorization.manual', 'Manual'),
          color: Colors.success[500],
          backgroundColor: 'white',
          borderColor: Colors.success[500],
        };
      default:
        return {
          IconComponent: AlertTriangle,
          label: t('budget.categorization.uncategorized', 'Sin categorizar'),
          color: Colors.warning[500],
          backgroundColor: 'white',
          borderColor: Colors.warning[500],
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.IconComponent;

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: Colors.gray[100],
    }}>
      <View style={{
        backgroundColor: config.backgroundColor,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: config.borderColor,
        borderWidth: 0.5,
      }}>
        <IconComponent size={14} color={config.color} style={{ marginRight: 4 }} />
        <Text
          className="text-xs font-medium"
          style={{ color: config.color }}
        >
          {config.label}
        </Text>
      </View>
    </View>
  );
}
