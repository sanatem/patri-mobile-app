import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/Colors';
import { ChevronDown, AlertTriangle } from 'lucide-react-native';
import { FloidTransaction } from '@/services/budget/get-floid-transactions';
import { TransactionItem } from './TransactionItem';

interface UncategorizedListProps {
  uncategorizedTransactions: FloidTransaction[];
  isExpanded: boolean;
  rotateStyle: any;
  selectedTransactions: Set<number>;
  transactionAnimations: Map<number, Animated.Value>;
  transactionType: 'income' | 'outcome';
  onToggle: () => void;
  onTransactionPress: (transactionId: number) => void;
}

export function UncategorizedList({
  uncategorizedTransactions,
  isExpanded,
  rotateStyle,
  selectedTransactions,
  transactionAnimations,
  transactionType,
  onToggle,
  onTransactionPress,
}: UncategorizedListProps) {
  const { t } = useTranslation();

  if (uncategorizedTransactions.length === 0) {
    return null;
  }

  return (
    <View style={{
      marginHorizontal: 20,
      marginTop: 20,
      backgroundColor: 'white',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors.warning[500],
      overflow: 'hidden'
    }}>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
        }}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <AlertTriangle size={24} color={Colors.warning[500]} style={{ marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <Text className="text-base font-medium" style={{ color: Colors.warning[600] }}>
            {t('budget.uncategorized', 'Sin Categorizar')} ({uncategorizedTransactions.length})
          </Text>
        </View>
        <Animated.View style={rotateStyle}>
          <ChevronDown size={20} color={Colors.warning[500]} />
        </Animated.View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          {uncategorizedTransactions.map((transaction) => {
            const isSelected = selectedTransactions.has(transaction.id);
            const animation = transactionAnimations.get(transaction.id) || new Animated.Value(0);

            return (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                transactionType={transactionType}
                isSelected={isSelected}
                animation={animation}
                onPress={onTransactionPress}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}
