import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/Colors';
import { ChevronDown, AlertTriangle } from 'lucide-react-native';
import { FloidTransaction } from '@/services/budget/transactions/get-floid-transactions';
import { TransactionItem } from './TransactionItem';
import { SearchBar, CheckboxItem } from '@/components/ui';

interface UncategorizedListProps {
  uncategorizedTransactions: FloidTransaction[];
  isExpanded: boolean;
  rotateStyle: any;
  selectedTransactions: Set<number>;
  transactionAnimations: Map<number, Animated.Value>;
  transactionType: 'income' | 'outcome';
  onToggle: () => void;
  onTransactionPress: (transactionId: number) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
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
  onSelectAll,
  onDeselectAll,
}: UncategorizedListProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) {
      return uncategorizedTransactions;
    }

    const query = searchQuery.toLowerCase().trim();
    return uncategorizedTransactions.filter(transaction =>
      transaction.description.toLowerCase().includes(query)
    );
  }, [uncategorizedTransactions, searchQuery]);

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
          <View style={{ marginBottom: 12 }}>
            <SearchBar
              placeholder={t('budget.search_transactions', 'Buscar transacciones...')}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {filteredTransactions.length > 0 ? (
            <>
              {selectedTransactions.size > 0 && (
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 12,
                    marginBottom: 8,
                    borderRadius: 8,
                  }}
                  onPress={() => {
                    const allSelected = filteredTransactions.every(t => selectedTransactions.has(t.id));
                    if (allSelected && onDeselectAll) {
                      onDeselectAll();
                    } else if (onSelectAll) {
                      onSelectAll();
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={{ marginRight: 12 }}>
                    <CheckboxItem
                      selected={filteredTransactions.every(t => selectedTransactions.has(t.id)) && filteredTransactions.length > 0}
                      size={18}
                    />
                  </View>
                  <Text className="text-sm font-regular" style={{ color: Colors.primary[600] }}>
                    {t('budget.select_all', 'Seleccionar todas')}
                  </Text>
                </TouchableOpacity>
              )}

              {filteredTransactions.map((transaction) => {
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
            </>
          ) : (
            <Text style={{
              textAlign: 'center',
              color: Colors.gray[500],
              paddingVertical: 20
            }}>
              {t('budget.no_transactions_found', 'No se encontraron transacciones')}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
