import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Header as UIHeader } from '@/components/ui';
import { Trash2, ArrowRight } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface CategoriesManagerHeaderProps {
  activeTab: 'income' | 'expenses';
  selectionMode: boolean;
  transactionSelectionMode: boolean;
  selectedCategories: Set<string>;
  selectedSubcategories: Set<string>;
  selectedTransactions: Set<number>;
  onCancelSelection: () => void;
  onCancelTransactionSelection: () => void;
  onDeleteSelected: () => void;
  onDeleteTransactions: () => void;
  onMoveTransactions: () => void;
  t: (key: string, fallback: string) => string;
}

export function CategoriesManagerHeader({
  activeTab,
  selectionMode,
  transactionSelectionMode,
  selectedCategories,
  selectedSubcategories,
  selectedTransactions,
  onCancelSelection,
  onCancelTransactionSelection,
  onDeleteSelected,
  onDeleteTransactions,
  onMoveTransactions,
  t,
}: CategoriesManagerHeaderProps) {
  const getTitle = () => {
    if (transactionSelectionMode) {
      return `${selectedTransactions.size} seleccionadas`;
    }
    if (selectionMode) {
      return `${selectedCategories.size + selectedSubcategories.size} seleccionadas`;
    }
    return t('budget.categories_manager', 'Categorías');
  };

  const getLeftAction = () => {
    if (transactionSelectionMode) {
      return (
        <TouchableOpacity onPress={onCancelTransactionSelection} style={{ padding: 8 }}>
          <Text className="text-base font-medium" style={{ color: Colors.primary[500] }}>
            Cancelar
          </Text>
        </TouchableOpacity>
      );
    }
    if (selectionMode) {
      return (
        <TouchableOpacity onPress={onCancelSelection} style={{ padding: 8 }}>
          <Text className="text-base font-medium" style={{ color: Colors.primary[500] }}>
            Cancelar
          </Text>
        </TouchableOpacity>
      );
    }
    return undefined;
  };

  const getRightAction = () => {
    if (transactionSelectionMode) {
      return (
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={onDeleteTransactions}
            style={{ padding: 8 }}
            disabled={selectedTransactions.size === 0}
          >
            <Trash2
              size={20}
              color={selectedTransactions.size > 0 ? Colors.error[500] : Colors.gray[400]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onMoveTransactions}
            style={{ padding: 8 }}
            disabled={selectedTransactions.size === 0}
          >
            <ArrowRight
              size={20}
              color={selectedTransactions.size > 0 ? Colors.primary[500] : Colors.gray[400]}
            />
          </TouchableOpacity>
        </View>
      );
    }
    if (selectionMode) {
      return (
        <TouchableOpacity
          onPress={onDeleteSelected}
          style={{ padding: 8 }}
          disabled={selectedSubcategories.size === 0 && selectedCategories.size === 0}
        >
          <Trash2
            size={20}
            color={(selectedSubcategories.size > 0 || selectedCategories.size > 0) ? Colors.error[500] : Colors.gray[400]}
          />
        </TouchableOpacity>
      );
    }
    return undefined;
  };

  return (
    <UIHeader
      title={getTitle()}
      showBackButton={!selectionMode && !transactionSelectionMode}
      leftAction={getLeftAction()}
      rightAction={getRightAction()}
    />
  );
}
