import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { CheckboxItem } from '@/components/ui';
import Colors from '@/constants/Colors';
import { FloidTransaction } from '@/services/budget/transactions/get-floid-transactions';

interface TransactionItemProps {
  transaction: FloidTransaction;
  transactionType: 'income' | 'outcome';
  isSelected: boolean;
  animation: Animated.Value;
  onPress: (transactionId: number) => void;
}

export function TransactionItem({
  transaction,
  transactionType,
  isSelected,
  animation,
  onPress,
}: TransactionItemProps) {
  // Interpolaciones de animación
  const checkboxOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1]
  });

  const checkboxScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1]
  });

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: Colors.gray[100],
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
      }}
    >
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}
        onPress={() => onPress(transaction.id)}
        activeOpacity={0.7}
      >
        <Animated.View style={{
          marginRight: 12,
          opacity: checkboxOpacity,
          transform: [{ scale: checkboxScale }]
        }}>
          <CheckboxItem selected={isSelected} size={18} />
        </Animated.View>
        <View style={{ flex: 1 }}>
          <Text className="text-sm font-medium" style={{ color: Colors.primary[600] }}>
            {transactionType === 'income' ? '+' : '-'}${Math.round(transaction.amount).toLocaleString('es-CL')}
          </Text>
          <Text className="text-sm font-regular" style={{ color: Colors.primary[500], marginTop: 2 }}>
            {transaction.description}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
