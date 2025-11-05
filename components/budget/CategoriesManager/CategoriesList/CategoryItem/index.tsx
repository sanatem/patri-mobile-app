import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, TextInput, Easing } from 'react-native';
import { CheckboxItem, Button } from '@/components/ui';
import Colors from '@/constants/Colors';
import { ChevronDown, Edit2, Plus, X, Check } from 'lucide-react-native';
import { FloidTransaction } from '@/services/budget/transactions/get-floid-transactions';
import { CategoryTranslation } from '@/hooks/budget/useCategoriesManager/types';
import { SubCategoryItem } from '../SubCategoryItem';
import { TransactionItem } from '../../UncategorizedList/TransactionItem';
import { NewSubcategoryCard } from '../../NewSubcategoryCard';
import { CustomSubcategoryCard } from '../../CustomSubcategoryCard';

interface CategoryItemProps {
  category: {
    id: string;
    name: CategoryTranslation;
    emoji: string;
    originalName?: string; // display_name del API
    originalEmoji?: string; // emoji_code del API
    isCustomCategory?: boolean; // Indica si es categoría personalizada
    subcategories?: Array<{
      id: string;
      name: CategoryTranslation;
      emoji: string;
      originalName?: string; // display_name del API
      originalEmoji?: string; // emoji_code del API
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
  isActive: boolean;
  categoryAnimation: Animated.Value;
  categoryRotateStyle: any;
  expandedSubcategories: Set<string>;
  selectedSubcategories: Set<string>;
  selectedTransactions: Set<number>;
  selectionAnimations: Map<string, Animated.Value>;
  transactionAnimations: Map<number, Animated.Value>;
  transactionType: 'income' | 'outcome';
  updatingCategory: boolean;
  editingParentCategoryId: string | null;
  pendingEdits: Map<string, { name: string; emoji: string }>;
  addingSubcategoryForCategoryId: string | null;
  multipleNewSubcategories: Array<{ id: string; systemSubcategoryId: string | null }>;
  multipleCustomSubcategories: Array<{ id: string; name: string; emoji: string }>;
  creatingCategory: boolean;
  subcategoryCardRefs: Map<string, any>;
  scrollViewRef?: any;
  isPremium: boolean;
  onCategoryPress: (categoryId: string) => void;
  onCategoryLongPress: (categoryId: string) => void;
  onSubcategoryPress: (subcategoryId: string) => void;
  onSubcategoryLongPress: (subcategoryId: string) => void;
  onTransactionPress: (transactionId: number) => void;
  onStartEdit: (categoryId: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onEditNameChange: (categoryId: string, name: string) => void;
  onEditEmojiChange: (categoryId: string, emoji: string) => void;
  onAddSubcategory: (categoryId: string) => void;
  onCancelAddSubcategory: () => void;
  onSelectSystemSubcategory: (cardId: string, subcategoryId: string) => void;
  onAddNewSubcategoryCard: (categoryId: string) => void;
  onRemoveNewSubcategoryCard: (cardId: string) => void;
  onCustomSubcategoryNameChange: (cardId: string, text: string) => void;
  onCustomSubcategoryEmojiChange: (cardId: string, text: string) => void;
  onAddNewCustomSubcategoryCard: () => void;
  onRemoveCustomSubcategoryCard: (cardId: string) => void;
  onConfirmNewSubcategories: () => void;
  onPremiumFeaturePress: (featureName: string) => void;
  getAvailableSubcategoriesForCategory: (categoryId: string, currentCardId?: string) => Array<{
    id: string;
    name: CategoryTranslation;
    emoji: string;
  }>;
  canAddMoreSubcategories: (categoryId: string) => boolean;
  getMaxSubcategoriesAllowed: (categoryId: string) => number;
  getRotateStyle: (id: string, isCategory: boolean, isExpanded?: boolean) => any;
  getExpansionStyle: (id: string, isCategory: boolean, isExpanded?: boolean) => any;
  categoryRotations: Map<string, Animated.Value>;
  categoryExpansions: Map<string, Animated.Value>;
  subcategoryRotations: Map<string, Animated.Value>;
  subcategoryExpansions: Map<string, Animated.Value>;
}

export function CategoryItem({
  category,
  currentLang,
  selectionMode,
  isCategorySelected,
  isExpanded,
  isActive,
  categoryAnimation,
  categoryRotateStyle,
  expandedSubcategories,
  selectedSubcategories,
  selectedTransactions,
  selectionAnimations,
  transactionAnimations,
  transactionType,
  updatingCategory,
  editingParentCategoryId,
  pendingEdits,
  addingSubcategoryForCategoryId,
  multipleNewSubcategories,
  multipleCustomSubcategories,
  creatingCategory,
  subcategoryCardRefs,
  scrollViewRef,
  isPremium,
  onCategoryPress,
  onCategoryLongPress,
  onSubcategoryPress,
  onSubcategoryLongPress,
  onTransactionPress,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditNameChange,
  onEditEmojiChange,
  onAddSubcategory,
  onCancelAddSubcategory,
  onSelectSystemSubcategory,
  onAddNewSubcategoryCard,
  onRemoveNewSubcategoryCard,
  onCustomSubcategoryNameChange,
  onCustomSubcategoryEmojiChange,
  onAddNewCustomSubcategoryCard,
  onRemoveCustomSubcategoryCard,
  onConfirmNewSubcategories,
  onPremiumFeaturePress,
  getAvailableSubcategoriesForCategory,
  canAddMoreSubcategories,
  getMaxSubcategoriesAllowed,
  getRotateStyle,
  getExpansionStyle,
  categoryRotations,
  categoryExpansions,
  subcategoryRotations,
  subcategoryExpansions,
}: CategoryItemProps) {
  const categoryCheckboxOpacity = categoryAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1]
  });

  const categoryCheckboxScale = categoryAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1]
  });

  const isEditingMode = editingParentCategoryId === category.id; // Modo edición habilitado para esta categoría
  const categoryPendingEdit = pendingEdits.get(category.id);
  const isEditingCategory = isEditingMode && categoryPendingEdit !== undefined;

  const hasChanges = isEditingMode && Array.from(pendingEdits.entries()).some(([id, edits]) => {
    if (id === category.id) {
      const originalName = category.originalName || category.name[currentLang as keyof typeof category.name];
      const originalEmoji = category.originalEmoji || category.emoji;
      return edits.name !== originalName || edits.emoji !== originalEmoji;
    }
    const subcat = category.subcategories?.find(s => s.id === id);
    if (subcat) {
      const originalName = subcat.originalName || subcat.name[currentLang as keyof typeof subcat.name];
      const originalEmoji = subcat.originalEmoji || subcat.emoji;
      return edits.name !== originalName || edits.emoji !== originalEmoji;
    }
    return false;
  });

  const contentHeightRef = useRef<number>(0);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [isMounted, setIsMounted] = useState(false);

  // Get expansion animation value
  const expansionValue = categoryExpansions.get(category.id);
  
  // Create expansion style dynamically - use fixed large value for maxHeight
  // React Native interpolations don't update dynamically, so we use a large fixed value
  const expansionStyle = expansionValue ? {
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

  // Sync rotation animation with expanded state
  useEffect(() => {
    // Ensure animations exist
    if (!categoryRotations.has(category.id)) {
      categoryRotations.set(category.id, new Animated.Value(0));
    }
    if (!categoryExpansions.has(category.id)) {
      categoryExpansions.set(category.id, new Animated.Value(0));
    }
    
    const rotation = categoryRotations.get(category.id)!;
    const expansion = categoryExpansions.get(category.id)!;
    
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
            duration: 450,
            useNativeDriver: true,
            easing: toValue === 1 
              ? Easing.bezier(0.25, 0.1, 0.25, 1) // Smooth ease-out for expand
              : Easing.bezier(0.4, 0.0, 0.2, 1), // Smooth ease-in for collapse
          }),
          Animated.timing(expansion, {
            toValue,
            duration: 450,
            useNativeDriver: false,
            easing: toValue === 1 
              ? Easing.bezier(0.25, 0.1, 0.25, 1) // Smooth ease-out for expand
              : Easing.bezier(0.4, 0.0, 0.2, 1), // Smooth ease-in for collapse
          })
        ]).start();
      });
    } else if (isExpanded) {
      // If component mounts already expanded, set values immediately without animation
      rotation.setValue(1);
      expansion.setValue(1);
    }
  }, [isExpanded, isActive, isMounted, category.id, categoryRotations, categoryExpansions]);

  const handleContentLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0 && height !== contentHeightRef.current) {
      contentHeightRef.current = height;
      setContentHeight(height);
    }
  };

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
          onPress={() => !isEditingMode && onCategoryPress(category.id)}
          onLongPress={() => !isEditingMode && onCategoryLongPress(category.id)}
          activeOpacity={isEditingMode ? 1 : 0.7}
          disabled={isEditingMode}
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

          {isEditingCategory ? (
            <TextInput
              style={{
                fontSize: 24,
                marginRight: 12,
                width: 40,
                textAlign: 'center',
              }}
              value={categoryPendingEdit?.emoji || ''}
              onChangeText={(text) => onEditEmojiChange(category.id, text)}
              maxLength={2}
            />
          ) : (
            <Text style={{
              fontSize: 24,
              marginRight: 12,
              textDecorationLine: isEditingMode ? 'underline' : 'none',
              textDecorationColor: isEditingMode ? Colors.primary[300] : 'transparent',
            }}>
              {category.emoji}
            </Text>
          )}

          <View style={{ flex: 1 }}>
            {isEditingCategory ? (
              <TextInput
                className="font-medium"
                style={{
                  fontSize: 16,
                  color: Colors.primary[600],
                  borderBottomWidth: 1,
                  borderBottomColor: Colors.primary[300],
                  paddingVertical: 4,
                }}
                value={categoryPendingEdit?.name || ''}
                onChangeText={(text) => onEditNameChange(category.id, text)}
                autoFocus
              />
            ) : (
              <>
                <Text
                  className="text-base font-medium"
                  style={{
                    color: Colors.primary[600],
                    textDecorationLine: isEditingMode ? 'underline' : 'none',
                    textDecorationColor: isEditingMode ? Colors.primary[300] : 'transparent',
                  }}
                >
                  {category.name[currentLang as keyof typeof category.name] || category.name.es}
                </Text>
                {category.transactionCount > 0 && (
                  <Text className="text-sm font-regular" style={{ color: Colors.primary[500], marginTop: 2 }}>
                    ${Math.round(category.total).toLocaleString('es-CL')}
                  </Text>
                )}
              </>
            )}
          </View>
        </TouchableOpacity>
        {!selectionMode && (
          <>
            {isEditingMode ? (
              <>
                <TouchableOpacity
                  style={{ padding: 4, marginRight: 8 }}
                  onPress={(e) => {
                    e.stopPropagation();
                    onCancelEdit();
                  }}
                >
                  <X size={16} color={Colors.gray[500]} />
                </TouchableOpacity>

                {hasChanges && (
                  <TouchableOpacity
                    style={{ padding: 4, marginRight: 8 }}
                    onPress={(e) => {
                      e.stopPropagation();
                      onSaveEdit();
                    }}
                    disabled={updatingCategory}
                  >
                    <Check size={16} color={updatingCategory ? Colors.gray[400] : Colors.success[500]} />
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={{ padding: 4, marginRight: 8 }}
                  onPress={(e) => {
                    e.stopPropagation();
                    if (!isPremium) {
                      onPremiumFeaturePress('Edición de Categorías');
                      return;
                    }
                    onStartEdit(category.id);
                  }}
                >
                  <Edit2 size={16} color={Colors.primary[500]} />
                </TouchableOpacity>

                <Animated.View style={categoryRotateStyle}>
                  <ChevronDown size={20} color={Colors.primary[500]} />
                </Animated.View>
              </>
            )}
          </>
        )}
      </View>

      {isActive && isExpanded && (
        <Animated.View 
          style={[
            expansionStyle,
            { overflow: 'hidden' }
          ]}
        >
          <View 
            style={{ paddingHorizontal: 16, paddingBottom: 16 }}
            onLayout={handleContentLayout}
          >
          {category.uncategorizedTransactions.length > 0 && (
            <View style={{ marginBottom: 8 }}>
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

          {category.subcategories && category.subcategories.map((subcat) => {
            const isSelected = selectedSubcategories.has(subcat.id);
            const animation = selectionAnimations.get(subcat.id) || new Animated.Value(0);
            const isSubcatExpanded = expandedSubcategories.has(subcat.id);
            const rotateStyle = getRotateStyle(subcat.id, false, isSubcatExpanded);

            return (
              <SubCategoryItem
                key={subcat.id}
                subcat={subcat}
                currentLang={currentLang}
                selectionMode={selectionMode}
                isSelected={isSelected}
                isExpanded={isSubcatExpanded}
                isActive={isActive}
                animation={animation}
                rotateStyle={rotateStyle}
                expansionStyle={getExpansionStyle(subcat.id, false, isSubcatExpanded)}
                subcategoryRotations={subcategoryRotations}
                subcategoryExpansions={subcategoryExpansions}
                transactionType={transactionType}
                selectedTransactions={selectedTransactions}
                transactionAnimations={transactionAnimations}
                updatingCategory={updatingCategory}
                editingParentCategoryId={editingParentCategoryId}
                pendingEdits={pendingEdits}
                parentCategoryId={category.id}
                onPress={onSubcategoryPress}
                onLongPress={onSubcategoryLongPress}
                onTransactionPress={onTransactionPress}
                onEditNameChange={onEditNameChange}
                onEditEmojiChange={onEditEmojiChange}
              />
            );
          })}

          {addingSubcategoryForCategoryId === category.id && (
            <>
              {multipleNewSubcategories.map((card, index) => {
                const availableSubcats = getAvailableSubcategoriesForCategory(category.id, card.id);
                const maxAllowed = getMaxSubcategoriesAllowed(category.id);
                const canAddMore = multipleNewSubcategories.length < maxAllowed;
                const isLastCard = index === multipleNewSubcategories.length - 1;

                return (
                  <NewSubcategoryCard
                    key={card.id}
                    ref={(ref) => {
                      if (ref) {
                        subcategoryCardRefs.set(card.id, ref);
                      } else {
                        subcategoryCardRefs.delete(card.id);
                      }
                    }}
                    currentLang={currentLang}
                    availableSubcategories={availableSubcats}
                    selectedSubcategoryId={card.systemSubcategoryId}
                    onSelectSubcategory={(subcatId) => onSelectSystemSubcategory(card.id, subcatId)}
                    showAddButton={isLastCard}
                    showRemoveButton={multipleNewSubcategories.length > 1}
                    onAdd={() => onAddNewSubcategoryCard(category.id)}
                    onRemove={() => onRemoveNewSubcategoryCard(card.id)}
                    canAdd={canAddMore}
                  />
                );
              })}

              {multipleCustomSubcategories.map((card, index) => {
                const maxAllowed = getMaxSubcategoriesAllowed(category.id);
                const canAddMore = multipleCustomSubcategories.length < maxAllowed;
                const isLastCard = index === multipleCustomSubcategories.length - 1;

                return (
                  <CustomSubcategoryCard
                    key={card.id}
                    ref={(ref) => {
                      if (ref) {
                        subcategoryCardRefs.set(card.id, ref);
                      } else {
                        subcategoryCardRefs.delete(card.id);
                      }
                    }}
                    subcategoryName={card.name}
                    subcategoryEmoji={card.emoji}
                    onNameChange={(text) => onCustomSubcategoryNameChange(card.id, text)}
                    onEmojiChange={(text) => onCustomSubcategoryEmojiChange(card.id, text)}
                    showAddButton={isLastCard}
                    showRemoveButton={multipleCustomSubcategories.length > 1}
                    onAdd={onAddNewCustomSubcategoryCard}
                    onRemove={() => onRemoveCustomSubcategoryCard(card.id)}
                    canAdd={canAddMore}
                    scrollViewRef={scrollViewRef}
                  />
                );
              })}
            </>
          )}

          {!selectionMode && !isEditingMode && addingSubcategoryForCategoryId !== category.id && (
            <>
              <View style={{
                height: 0.5,
                backgroundColor: Colors.gray[100],
                marginVertical: 2,
              }} />
              <View style={{ transform: [{ scale: 0.9 }] }}>
                <Button
                  title="Subcategoría"
                  variant="ghost"
                  fullWidth
                  icon={<Plus size={16} color={canAddMoreSubcategories(category.id) ? Colors.primary[500] : Colors.gray[300]} />}
                  onPress={() => onAddSubcategory(category.id)}
                  disabled={!canAddMoreSubcategories(category.id)}
                />
              </View>
            </>
          )}
        </View>
        </Animated.View>
      )}
    </View>
  );
}
