import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { CheckboxItem } from '@/components/ui';
import Colors from '@/constants/Colors';
import { ChevronDown, Edit2, Plus } from 'lucide-react-native';
import { FloidTransaction } from '@/services/budget/transactions/get-floid-transactions';
import { SubCategoryItem } from '../SubCategoryItem';
import { TransactionItem } from '../../UncategorizedList/TransactionItem';

interface CategoryItemProps {
  category: {
    id: string;
    name: { es: string; en: string; pt: string };
    emoji: string;
    subcategories?: Array<{
      id: string;
      name: { es: string; en: string; pt: string };
      emoji: string;
      transactions: FloidTransaction[];
      total: number;
    }>;
    uncategorizedTransactions: FloidTransaction[];
    total: number;
    transactionCount: number;
  };
  currentLang: string;
  selectionMode: boolean;
  isCategorySelected: boolean;
  isExpanded: boolean;
  categoryAnimation: Animated.Value;
  categoryRotateStyle: any;
  expandedSubcategories: Set<string>;
  selectedSubcategories: Set<string>;
  selectedTransactions: Set<number>;
  selectionAnimations: Map<string, Animated.Value>;
  transactionAnimations: Map<number, Animated.Value>;
  transactionType: 'income' | 'outcome';
  onCategoryPress: (categoryId: string) => void;
  onCategoryLongPress: (categoryId: string) => void;
  onSubcategoryPress: (subcategoryId: string) => void;
  onSubcategoryLongPress: (subcategoryId: string) => void;
  onTransactionPress: (transactionId: number) => void;
  getRotateStyle: (id: string, isCategory: boolean) => any;
}

export function CategoryItem({
  category,
  currentLang,
  selectionMode,
  isCategorySelected,
  isExpanded,
  categoryAnimation,
  categoryRotateStyle,
  expandedSubcategories,
  selectedSubcategories,
  selectedTransactions,
  selectionAnimations,
  transactionAnimations,
  transactionType,
  onCategoryPress,
  onCategoryLongPress,
  onSubcategoryPress,
  onSubcategoryLongPress,
  onTransactionPress,
  getRotateStyle,
}: CategoryItemProps) {
  const categoryCheckboxOpacity = categoryAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1]
  });

  const categoryCheckboxScale = categoryAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1]
  });

  return (
    <View
      style={{
        marginHorizontal: 20,
        marginTop: 20,
        backgroundColor: 'white',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.gray[100],
        overflow: 'hidden'
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
        }}
      >
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
          onPress={() => onCategoryPress(category.id)}
          onLongPress={() => onCategoryLongPress(category.id)}
          activeOpacity={0.7}
        >
          {selectionMode && (
            <Animated.View style={{
              marginRight: 12,
              opacity: categoryCheckboxOpacity,
              transform: [{ scale: categoryCheckboxScale }]
            }}>
              <CheckboxItem selected={isCategorySelected} size={18} />
            </Animated.View>
          )}
          <Text style={{ fontSize: 24, marginRight: 12 }}>{category.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text className="text-base font-medium" style={{ color: Colors.primary[600] }}>
              {category.name[currentLang as keyof typeof category.name] || category.name.es}
            </Text>
            {category.transactionCount > 0 && (
              <Text className="text-sm font-regular" style={{ color: Colors.primary[500], marginTop: 2 }}>
                ${Math.round(category.total).toLocaleString('es-CL')}
              </Text>
            )}
          </View>
        </TouchableOpacity>
        {!selectionMode && (
          <>
            <TouchableOpacity
              style={{ padding: 4, marginRight: 8 }}
              onPress={(e) => {
                e.stopPropagation();
                // TODO: Implementar creaci�n de subcategor�a
              }}
            >
              <Plus size={16} color={Colors.primary[500]} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ padding: 4, marginRight: 8 }}
              onPress={(e) => {
                e.stopPropagation();
                // TODO: Implementar edici�n
              }}
            >
              <Edit2 size={16} color={Colors.primary[500]} />
            </TouchableOpacity>
            <Animated.View style={categoryRotateStyle}>
              <ChevronDown size={20} color={Colors.primary[500]} />
            </Animated.View>
          </>
        )}
      </View>

      {isExpanded && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          {category.subcategories && category.subcategories.map((subcat) => {
            const isSelected = selectedSubcategories.has(subcat.id);
            const animation = selectionAnimations.get(subcat.id) || new Animated.Value(0);
            const isSubcatExpanded = expandedSubcategories.has(subcat.id);
            const rotateStyle = getRotateStyle(subcat.id, false);

            return (
              <SubCategoryItem
                key={subcat.id}
                subcat={subcat}
                currentLang={currentLang}
                selectionMode={selectionMode}
                isSelected={isSelected}
                isExpanded={isSubcatExpanded}
                animation={animation}
                rotateStyle={rotateStyle}
                transactionType={transactionType}
                selectedTransactions={selectedTransactions}
                transactionAnimations={transactionAnimations}
                onPress={onSubcategoryPress}
                onLongPress={onSubcategoryLongPress}
                onTransactionPress={onTransactionPress}
              />
            );
          })}

          {category.uncategorizedTransactions.length > 0 && (
            <View style={{ marginTop: 8 }}>
              {category.uncategorizedTransactions.map((transaction) => {
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
      )}
    </View>
  );
}
