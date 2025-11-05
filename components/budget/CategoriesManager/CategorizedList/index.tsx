import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/Colors';
import { ChevronDown, Folder } from 'lucide-react-native';
import { FloidTransaction } from '@/services/budget/transactions/get-floid-transactions';
import { TransactionItem } from '../UncategorizedList/TransactionItem';
import { SearchBar, CheckboxItem } from '@/components/ui';

interface CategorizedListProps {
  categorizedTransactions: FloidTransaction[];
  isExpanded: boolean;
  isActive: boolean;
  shouldShowContent: boolean;
  rotateStyle: any;
  expansionStyle: any;
  categoryRotations: Map<string, Animated.Value>;
  categoryExpansions: Map<string, Animated.Value>;
  selectedTransactions: Set<number>;
  transactionAnimations: Map<number, Animated.Value>;
  transactionType: 'income' | 'outcome';
  onToggle: () => void;
  onTransactionPress: (transactionId: number) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
}

export function CategorizedList({
  categorizedTransactions,
  isExpanded,
  isActive,
  shouldShowContent,
  rotateStyle,
  expansionStyle,
  categoryRotations,
  categoryExpansions,
  selectedTransactions,
  transactionAnimations,
  transactionType,
  onToggle,
  onTransactionPress,
  onSelectAll,
  onDeselectAll,
}: CategorizedListProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [shouldRenderContent, setShouldRenderContent] = useState(false);
  const activeAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  // Get expansion animation value
  const expansionValue = categoryExpansions.get('categorized');
  
  // Create expansion style dynamically - use fixed large value for maxHeight
  // React Native interpolations don't update dynamically, so we use a large fixed value
  const dynamicExpansionStyle = expansionValue ? {
    opacity: expansionValue.interpolate({
      inputRange: [0, 0.3, 1],
      outputRange: [0, 0.6, 1], // Smoother fade in progression
    }),
    maxHeight: expansionValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 10000], // Fixed large value that will accommodate any content
    }),
  } : { opacity: 0, maxHeight: 0 };

  // Animate active state changes (horizontal transition)
  useEffect(() => {
    Animated.spring(activeAnim, {
      toValue: isActive ? 1 : 0,
      useNativeDriver: true,
      tension: 40,
      friction: 12,
      velocity: 0,
    }).start();
  }, [isActive, activeAnim]);

  // Create animated styles for card opacity and scale
  const cardOpacity = activeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const cardScale = activeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.97, 1],
  });


  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) {
      return categorizedTransactions;
    }

    const query = searchQuery.toLowerCase().trim();
    return categorizedTransactions.filter(transaction =>
      transaction.description.toLowerCase().includes(query)
    );
  }, [categorizedTransactions, searchQuery]);

  // Sync rotation animation with expanded state
  useEffect(() => {
    // Ensure animations exist
    if (!categoryRotations.has('categorized')) {
      categoryRotations.set('categorized', new Animated.Value(0));
    }
    if (!categoryExpansions.has('categorized')) {
      categoryExpansions.set('categorized', new Animated.Value(0));
    }

    const rotation = categoryRotations.get('categorized')!;
    const expansion = categoryExpansions.get('categorized')!;

    // Use isExpanded directly instead of shouldShowContent
    // This ensures animation always runs when state changes
    const toValue = (isActive && isExpanded) ? 1 : 0;
    
    // If inactive, set values immediately without animation
    if (!isActive) {
      rotation.setValue(0);
      expansion.setValue(0);
      setShouldRenderContent(false);
      return;
    }
    
    // Always animate when card is active (whether expanding or collapsing)
    // This ensures both expand and collapse animations are visible
    // Stop any ongoing animation first
    rotation.stopAnimation();
    expansion.stopAnimation();
    
    // If expanding, render content immediately
    if (isExpanded) {
      setShouldRenderContent(true);
    }
    
    // Animate collapse/expand - use requestAnimationFrame to ensure layout is ready
    requestAnimationFrame(() => {
      Animated.parallel([
        Animated.timing(rotation, {
          toValue,
          duration: 280,
          useNativeDriver: true,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Smooth ease for both expand and collapse
        }),
        Animated.timing(expansion, {
          toValue,
          duration: 280,
          useNativeDriver: false,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Smooth ease for both expand and collapse
        })
      ]).start((finished) => {
        // After animation completes, update render state
        if (finished && !isExpanded) {
          setShouldRenderContent(false);
        }
      });
    });
  }, [isExpanded, isActive, categoryRotations, categoryExpansions]);

  if (categorizedTransactions.length === 0) {
    return null;
  }

  return (
    <Animated.View style={{
      backgroundColor: 'white',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors.success[500],
      overflow: 'hidden',
      flex: isActive ? 1 : undefined,
      width: isActive ? undefined : 56,
      height: isActive ? undefined : 56,
      opacity: cardOpacity,
      transform: [{ scale: cardScale }],
    }}>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
          minHeight: 56,
          justifyContent: isActive ? 'flex-start' : 'center',
        }}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Folder size={24} color={Colors.success[500]} style={{ marginRight: isActive ? 12 : 0 }} />
        {isActive && (
          <>
            <View style={{ flex: 1 }}>
              <Text className="text-base font-medium" style={{ color: Colors.success[600] }}>
                {t('budget.categorized', 'Categorizadas')} ({categorizedTransactions.length})
              </Text>
            </View>
            <Animated.View style={rotateStyle}>
              <ChevronDown size={20} color={Colors.success[500]} />
            </Animated.View>
          </>
        )}
      </TouchableOpacity>

      {isActive && (shouldRenderContent || isExpanded) && (
        <Animated.View style={[dynamicExpansionStyle, { overflow: 'hidden' }]}>
          <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            <View style={{ marginBottom: 12 }}>
              <SearchBar
                placeholder={t('budget.search_transactions', 'Buscar transacciones...')}
                value={searchQuery}
                onChangeText={setSearchQuery}
                fontSize={14}
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
        </Animated.View>
      )}
    </Animated.View>
  );
}
