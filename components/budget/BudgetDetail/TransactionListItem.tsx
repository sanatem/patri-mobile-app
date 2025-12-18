import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Colors from '@/constants/Colors';
import type { BudgetInstanceTransaction } from '@/services/budget/budget-instances';

interface TransactionListItemProps {
  transaction: BudgetInstanceTransaction;
  onPress?: (transaction: BudgetInstanceTransaction) => void;
}

export function TransactionListItem({ transaction, onPress }: TransactionListItemProps) {
  const isIncome = transaction.type === 'income';

  const content = (
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
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text className="text-sm font-medium" style={{ color: Colors.primary[600] }}>
            {isIncome ? '+' : '-'}${Math.round(transaction.amount).toLocaleString('es-CL')}
          </Text>
          <Text className="text-sm font-regular" style={{ color: Colors.primary[500], marginTop: 2 }}>
            {transaction.description}
          </Text>
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={() => onPress(transaction)} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}
