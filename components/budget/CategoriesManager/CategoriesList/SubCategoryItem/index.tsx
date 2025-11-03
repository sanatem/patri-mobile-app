import React from 'react';
import { View, Text, TouchableOpacity, Animated, TextInput } from 'react-native';
import { CheckboxItem } from '@/components/ui';
import Colors from '@/constants/Colors';
import { ChevronDown, Edit2, X, Check } from 'lucide-react-native';
import { FloidTransaction } from '@/services/budget/transactions/get-floid-transactions';
import { TransactionItem } from '../../UncategorizedList/TransactionItem';

interface SubCategoryItemProps {
  subcat: {
    id: string;
    name: { es: string; en: string; pt: string };
    emoji: string;
    transactions: FloidTransaction[];
    total: number;
  };
  currentLang: string;
  selectionMode: boolean;
  isSelected: boolean;
  isExpanded: boolean;
  animation: Animated.Value;
  rotateStyle: any;
  transactionType: 'income' | 'outcome';
  selectedTransactions: Set<number>;
  transactionAnimations: Map<number, Animated.Value>;
  updatingCategory: boolean;
  editingParentCategoryId: string | null;
  pendingEdits: Map<string, { name: string; emoji: string }>;
  parentCategoryId: string;
  onPress: (subcategoryId: string) => void;
  onLongPress: (subcategoryId: string) => void;
  onTransactionPress: (transactionId: number) => void;
  onEditNameChange: (categoryId: string, name: string) => void;
  onEditEmojiChange: (categoryId: string, emoji: string) => void;
}

export function SubCategoryItem({
  subcat,
  currentLang,
  selectionMode,
  isSelected,
  isExpanded,
  animation,
  rotateStyle,
  transactionType,
  selectedTransactions,
  transactionAnimations,
  updatingCategory,
  editingParentCategoryId,
  pendingEdits,
  parentCategoryId,
  onPress,
  onLongPress,
  onTransactionPress,
  onEditNameChange,
  onEditEmojiChange,
}: SubCategoryItemProps) {
  // Interpolaciones de animación
  const checkboxOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1]
  });

  const checkboxScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1]
  });

  const isEditingModeEnabled = editingParentCategoryId === parentCategoryId; // Modo edición habilitado si la categoría padre está en edición
  const subcatPendingEdit = pendingEdits.get(subcat.id);
  const isEditingSubcat = isEditingModeEnabled && subcatPendingEdit !== undefined;

  return (
    <View style={{ marginBottom: 12 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: Colors.gray[100],
          backgroundColor: 'white',
        }}
      >
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
          onPress={() => !isEditingModeEnabled && onPress(subcat.id)}
          onLongPress={() => !isEditingModeEnabled && onLongPress(subcat.id)}
          activeOpacity={isEditingModeEnabled ? 1 : 0.7}
          disabled={isEditingModeEnabled}
        >
          {selectionMode && (
            <Animated.View style={{
              marginRight: 12,
              opacity: checkboxOpacity,
              transform: [{ scale: checkboxScale }]
            }}>
              <CheckboxItem selected={isSelected} size={18} />
            </Animated.View>
          )}

          {/* Emoji editable */}
          {isEditingSubcat ? (
            <TextInput
              style={{
                fontSize: 20,
                marginRight: 8,
                width: 36,
                textAlign: 'center',
              }}
              value={subcatPendingEdit?.emoji || ''}
              onChangeText={(text) => onEditEmojiChange(subcat.id, text)}
              maxLength={2}
            />
          ) : (
            <Text style={{
              fontSize: 20,
              marginRight: 8,
              textDecorationLine: isEditingModeEnabled ? 'underline' : 'none',
              textDecorationColor: isEditingModeEnabled ? Colors.primary[300] : 'transparent',
            }}>
              {subcat.emoji}
            </Text>
          )}

          <View style={{ flex: 1 }}>
            {/* Nombre editable */}
            {isEditingSubcat ? (
              <TextInput
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: Colors.primary[600],
                  borderBottomWidth: 1,
                  borderBottomColor: Colors.primary[300],
                  paddingVertical: 2,
                }}
                value={subcatPendingEdit?.name || ''}
                onChangeText={(text) => onEditNameChange(subcat.id, text)}
                autoFocus
              />
            ) : (
              <>
                <Text
                  className="text-sm font-medium"
                  style={{
                    color: Colors.primary[600],
                    textDecorationLine: isEditingModeEnabled ? 'underline' : 'none',
                    textDecorationColor: isEditingModeEnabled ? Colors.primary[300] : 'transparent',
                  }}
                >
                  {subcat.name[currentLang as keyof typeof subcat.name] || subcat.name.es}
                </Text>
                {subcat.transactions.length > 0 && (
                  <Text className="text-xs font-regular" style={{ color: Colors.primary[500], marginTop: 2 }}>
                    ${Math.round(subcat.total).toLocaleString('es-CL')}
                  </Text>
                )}
              </>
            )}
          </View>
        </TouchableOpacity>
        {!selectionMode && (
          <Animated.View style={rotateStyle}>
            <ChevronDown size={16} color={Colors.primary[500]} />
          </Animated.View>
        )}
      </View>

      {isExpanded && subcat.transactions.length > 0 && (
        <View style={{ marginTop: 8, marginLeft: 12 }}>
          {subcat.transactions.map((transaction) => {
            const isTransactionSelected = selectedTransactions.has(transaction.id);
            const transactionAnimation = transactionAnimations.get(transaction.id) || new Animated.Value(0);

            return (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                transactionType={transactionType}
                isSelected={isTransactionSelected}
                animation={transactionAnimation}
                onPress={onTransactionPress}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}
