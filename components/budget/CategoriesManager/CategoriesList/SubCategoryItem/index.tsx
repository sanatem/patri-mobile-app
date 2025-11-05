import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, TextInput, Easing } from 'react-native';
import { CheckboxItem } from '@/components/ui';
import Colors from '@/constants/Colors';
import { ChevronDown, Edit2, X, Check } from 'lucide-react-native';
import { FloidTransaction } from '@/services/budget/transactions/get-floid-transactions';
import { CategoryTranslation } from '@/hooks/budget/useCategoriesManager/types';
import { TransactionItem } from '../../UncategorizedList/TransactionItem';

interface SubCategoryItemProps {
  subcat: {
    id: string;
    name: CategoryTranslation;
    emoji: string;
    transactions: FloidTransaction[];
    total: number;
  };
  currentLang: string;
  selectionMode: boolean;
  isSelected: boolean;
  isExpanded: boolean;
  isActive: boolean;
  animation: Animated.Value;
  rotateStyle: any;
  expansionStyle: any;
  subcategoryRotations: Map<string, Animated.Value>;
  subcategoryExpansions: Map<string, Animated.Value>;
  transactionType: 'income' | 'outcome';
  selectedTransactions: Set<number>;
  transactionAnimations: Map<number, Animated.Value>;
  updatingCategory: boolean;
  editingParentCategoryId: string | null;
  pendingEdits: Map<string, { name: string; emoji: string }>;
  parentCategoryId: string;
  scrollViewRef?: any;
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
  isActive,
  animation,
  rotateStyle,
  expansionStyle,
  subcategoryRotations,
  subcategoryExpansions,
  transactionType,
  selectedTransactions,
  transactionAnimations,
  updatingCategory,
  editingParentCategoryId,
  pendingEdits,
  parentCategoryId,
  scrollViewRef,
  onPress,
  onLongPress,
  onTransactionPress,
  onEditNameChange,
  onEditEmojiChange,
}: SubCategoryItemProps) {
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

  const contentHeightRef = useRef<number>(0);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [isMounted, setIsMounted] = useState(false);
  const subcategoryViewRef = useRef<View>(null);

  // Get expansion animation value
  const expansionValue = subcategoryExpansions.get(subcat.id);
  
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

  // Mark component as mounted after first render
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync rotation animation with expanded state
  useEffect(() => {
    // Ensure animations exist
    if (!subcategoryRotations.has(subcat.id)) {
      subcategoryRotations.set(subcat.id, new Animated.Value(0));
    }
    if (!subcategoryExpansions.has(subcat.id)) {
      subcategoryExpansions.set(subcat.id, new Animated.Value(0));
    }
    
    const rotation = subcategoryRotations.get(subcat.id)!;
    const expansion = subcategoryExpansions.get(subcat.id)!;
    
    // Only animate if card is active AND expanded
    // If inactive, immediately set to 0 to prevent content from showing
    const toValue = (isActive && isExpanded) ? 1 : 0;
    
    // If inactive, set values immediately without animation
    if (!isActive) {
      rotation.setValue(0);
      expansion.setValue(0);
      return;
    }
    
    // Only animate if component is mounted (not on initial mount with isExpanded=true)
    // This ensures the animation is visible when expanding
    if (isMounted) {
      // Use requestAnimationFrame to ensure layout is ready before animating
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
        ]).start();

        // Auto-scroll to center the subcategory when expanding
        if (isExpanded && scrollViewRef?.current && subcategoryViewRef.current) {
          setTimeout(() => {
            subcategoryViewRef.current?.measureLayout(
              scrollViewRef.current,
              (x, y, width, height) => {
                // Calculate position to center the subcategory
                scrollViewRef.current?.scrollTo({
                  y: y - 100, // Offset to position near top with some padding
                  animated: true,
                });
              },
              () => {} // Error callback
            );
          }, 50); // Small delay to ensure layout is ready
        }
      });
    } else if (isExpanded) {
      // If component mounts already expanded, set values immediately without animation
      rotation.setValue(1);
      expansion.setValue(1);
    }
  }, [isExpanded, isActive, isMounted, subcat.id, subcategoryRotations, subcategoryExpansions, scrollViewRef]);

  const handleContentLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0 && height !== contentHeightRef.current) {
      contentHeightRef.current = height;
      setContentHeight(height);
    }
  };

  return (
    <View ref={subcategoryViewRef} style={{ marginBottom: 12 }}>
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
            {isEditingSubcat ? (
              <TextInput
                className="font-medium"
                style={{
                  fontSize: 14,
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
          <TouchableOpacity
            onPress={() => onPress(subcat.id)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Animated.View style={rotateStyle}>
              <ChevronDown size={16} color={Colors.primary[500]} />
            </Animated.View>
          </TouchableOpacity>
        )}
      </View>

      {isActive && isExpanded && (
        <Animated.View 
          style={[
            dynamicExpansionStyle,
            { overflow: 'hidden' }
          ]}
        >
          {subcat.transactions.length > 0 && (
            <View 
              style={{ marginTop: 8, marginLeft: 12 }}
              onLayout={handleContentLayout}
            >
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
        </Animated.View>
      )}
    </View>
  );
}
