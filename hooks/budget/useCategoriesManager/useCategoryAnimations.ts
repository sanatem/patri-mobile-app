import { useRef } from 'react';
import { Animated } from 'react-native';

export function useCategoryAnimations() {
  const categoryRotations = useRef<Map<string, Animated.Value>>(new Map()).current;
  const subcategoryRotations = useRef<Map<string, Animated.Value>>(new Map()).current;
  const selectionAnimations = useRef<Map<string, Animated.Value>>(new Map()).current;
  const transactionAnimations = useRef<Map<number, Animated.Value>>(new Map()).current;

  // Get or create rotation animation
  const getOrCreateRotation = (id: string, isCategory: boolean) => {
    const rotations = isCategory ? categoryRotations : subcategoryRotations;
    if (!rotations.has(id)) {
      rotations.set(id, new Animated.Value(0));
    }
    return rotations.get(id)!;
  };

  // Get rotate style for expansion arrows
  const getRotateStyle = (id: string, isCategory: boolean) => {
    const rotation = getOrCreateRotation(id, isCategory);
    return {
      transform: [
        {
          rotate: rotation.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '180deg'],
          }),
        },
      ],
    };
  };

  // Animate rotation
  const animateRotation = (id: string, isCategory: boolean, isExpanding: boolean) => {
    const rotation = getOrCreateRotation(id, isCategory);
    Animated.timing(rotation, {
      toValue: isExpanding ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // Get or create selection animation
  const getSelectionAnimation = (id: string) => {
    if (!selectionAnimations.has(id)) {
      selectionAnimations.set(id, new Animated.Value(0));
    }
    return selectionAnimations.get(id)!;
  };

  // Animate selection
  const animateSelection = (id: string, selected: boolean) => {
    const animation = getSelectionAnimation(id);
    Animated.spring(animation, {
      toValue: selected ? 1 : 0,
      useNativeDriver: false,
      friction: 8,
      tension: 40
    }).start();
  };

  // Get or create transaction animation
  const getTransactionAnimation = (id: number) => {
    if (!transactionAnimations.has(id)) {
      transactionAnimations.set(id, new Animated.Value(0));
    }
    return transactionAnimations.get(id)!;
  };

  // Animate transaction selection
  const animateTransactionSelection = (id: number, selected: boolean) => {
    const animation = getTransactionAnimation(id);
    Animated.spring(animation, {
      toValue: selected ? 1 : 0,
      useNativeDriver: false,
      friction: 8,
      tension: 40
    }).start();
  };

  // Batch animate selections
  const batchAnimateSelections = (ids: string[], selected: boolean) => {
    ids.forEach(id => animateSelection(id, selected));
  };

  // Batch animate transaction selections
  const batchAnimateTransactionSelections = (ids: number[], selected: boolean) => {
    ids.forEach(id => animateTransactionSelection(id, selected));
  };

  return {
    // Animation refs
    categoryRotations,
    subcategoryRotations,
    selectionAnimations,
    transactionAnimations,

    // Functions
    getRotateStyle,
    animateRotation,
    getSelectionAnimation,
    animateSelection,
    getTransactionAnimation,
    animateTransactionSelection,
    batchAnimateSelections,
    batchAnimateTransactionSelections,
  };
}
