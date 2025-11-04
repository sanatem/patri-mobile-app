import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/Colors';
import { ChevronDown, AlertTriangle } from 'lucide-react-native';
import { FloidTransaction } from '@/services/budget/transactions/get-floid-transactions';
import { TransactionItem } from './TransactionItem';
import { SearchBar, CheckboxItem } from '@/components/ui';

interface UncategorizedListProps {
  uncategorizedTransactions: FloidTransaction[];
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

export function UncategorizedList({
  uncategorizedTransactions,
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
}: UncategorizedListProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const contentHeightRef = useRef<number>(0);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [isMounted, setIsMounted] = useState(false);
  const [shouldRenderContent, setShouldRenderContent] = useState(false);
  const activeAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  // Get expansion animation value
  const expansionValue = categoryExpansions.get('uncategorized');
  
  // Create expansion style dynamically - use fixed large value for maxHeight
  // React Native interpolations don't update dynamically, so we use a large fixed value
  const dynamicExpansionStyle = expansionValue ? {
    opacity: expansionValue.interpolate({
      inputRange: [0, 0.15, 1],
      outputRange: [0, 0.9, 1], // More gradual fade for smoother vertical slide
    }),
    maxHeight: expansionValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 10000], // Fixed large value that will accommodate any content
    }),
  } : { opacity: 0, maxHeight: 0 };

  // Mark component as mounted after first render
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Animate active state changes (horizontal transition)
  useEffect(() => {
    Animated.timing(activeAnim, {
      toValue: isActive ? 1 : 0,
      duration: 350, // Horizontal transition duration (300-400ms range)
      easing: Easing.bezier(0.2, 0.0, 0.0, 1.0),
      useNativeDriver: false,
    }).start();
  }, [isActive, activeAnim]);

  // Create animated styles for card size and horizontal slide
  const cardWidth = activeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [56, 300], // Width when inactive vs active (will be overridden by flex when active)
  });

  const cardHeight = activeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [56, 300], // Height when inactive vs active (will be overridden when expanded)
  });


  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) {
      return uncategorizedTransactions;
    }

    const query = searchQuery.toLowerCase().trim();
    return uncategorizedTransactions.filter(transaction =>
      transaction.description.toLowerCase().includes(query)
    );
  }, [uncategorizedTransactions, searchQuery]);

  // Sync rotation animation with expanded state
  useEffect(() => {
    // Ensure animations exist
    if (!categoryRotations.has('uncategorized')) {
      categoryRotations.set('uncategorized', new Animated.Value(0));
    }
    if (!categoryExpansions.has('uncategorized')) {
      categoryExpansions.set('uncategorized', new Animated.Value(0));
    }
    
    const rotation = categoryRotations.get('uncategorized')!;
    const expansion = categoryExpansions.get('uncategorized')!;
    
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
    
    // Always animate when mounted and card is active (whether expanding or collapsing)
    // This ensures both expand and collapse animations are visible
    if (isMounted) {
      // Stop any ongoing animation first
      rotation.stopAnimation();
      expansion.stopAnimation();
      
      // If expanding, render content immediately
      if (isExpanded) {
        setShouldRenderContent(true);
      }
      
      // Use requestAnimationFrame to ensure layout is ready before animating
      requestAnimationFrame(() => {
        Animated.parallel([
          Animated.timing(rotation, {
            toValue,
            duration: isExpanded ? 450 : 350, // Smooth collapse (350ms), smooth expand (450ms)
            useNativeDriver: true,
            easing: isExpanded 
              ? Easing.bezier(0.25, 0.1, 0.25, 1) // Smooth ease-out for expand
              : Easing.bezier(0.4, 0.0, 0.2, 1), // Smooth ease-in for collapse
          }),
          Animated.timing(expansion, {
            toValue,
            duration: isExpanded ? 450 : 350, // Smooth collapse (350ms), smooth expand (450ms)
            useNativeDriver: false,
            easing: isExpanded 
              ? Easing.bezier(0.25, 0.1, 0.25, 1) // Smooth ease-out for expand
              : Easing.bezier(0.4, 0.0, 0.2, 1), // Smooth ease-in for collapse
          })
        ]).start((finished) => {
          // After animation completes, update render state
          if (finished && !isExpanded) {
            setShouldRenderContent(false);
          }
        });
      });
    } else if (isExpanded) {
      // If component mounts already expanded, set values immediately without animation
      rotation.setValue(1);
      expansion.setValue(1);
      setShouldRenderContent(true);
    }
  }, [isExpanded, isActive, isMounted, categoryRotations, categoryExpansions]);

  const handleContentLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0 && height !== contentHeightRef.current) {
      contentHeightRef.current = height;
      setContentHeight(height);
    }
  };

  if (uncategorizedTransactions.length === 0) {
    return null;
  }

  return (
    <Animated.View style={{
      backgroundColor: 'white',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors.warning[500],
      overflow: 'hidden',
      flex: isActive ? 1 : undefined,
      width: isActive ? undefined : cardWidth,
      height: isActive ? undefined : cardHeight,
    }}>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: 56,
          padding: 16,
          justifyContent: isActive ? 'flex-start' : 'center',
        }}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <AlertTriangle size={24} color={Colors.warning[500]} style={{ marginRight: isActive ? 12 : 0 }} />
        {isActive && (
          <>
            <View style={{ flex: 1 }}>
              <Text className="text-base font-medium" style={{ color: Colors.warning[600] }}>
                {t('budget.uncategorized', 'Sin Categorizar')} ({uncategorizedTransactions.length})
              </Text>
            </View>
            <Animated.View style={rotateStyle}>
              <ChevronDown size={20} color={Colors.warning[500]} />
            </Animated.View>
          </>
        )}
      </TouchableOpacity>

      {isActive && (shouldRenderContent || isExpanded) && (
        <Animated.View
          style={[
            dynamicExpansionStyle,
            { overflow: 'hidden' }
          ]}
        >
          <View 
            style={{ paddingHorizontal: 16, paddingBottom: 16 }}
            onLayout={handleContentLayout}
          >
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
        </Animated.View>
      )}
    </Animated.View>
  );
}
