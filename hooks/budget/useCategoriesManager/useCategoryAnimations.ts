import { useRef } from 'react';
import { Animated, Easing } from 'react-native';

export function useCategoryAnimations() {
  const categoryRotations = useRef<Map<string, Animated.Value>>(new Map()).current;
  const subcategoryRotations = useRef<Map<string, Animated.Value>>(new Map()).current;
  const selectionAnimations = useRef<Map<string, Animated.Value>>(new Map()).current;
  const transactionAnimations = useRef<Map<number, Animated.Value>>(new Map()).current;
  const categoryExpansions = useRef<Map<string, Animated.Value>>(new Map()).current;
  const subcategoryExpansions = useRef<Map<string, Animated.Value>>(new Map()).current;

  // Get or create rotation animation
  const getOrCreateRotation = (id: string, isCategory: boolean, isExpanded?: boolean) => {
    const rotations = isCategory ? categoryRotations : subcategoryRotations;
    if (!rotations.has(id)) {
      // Always initialize at 0 - useEffect will animate to correct state
      rotations.set(id, new Animated.Value(0));
    }
    return rotations.get(id)!;
  };

  // Get rotate style for expansion arrows
  const getRotateStyle = (id: string, isCategory: boolean, isExpanded?: boolean) => {
    const rotation = getOrCreateRotation(id, isCategory, isExpanded);
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
    const expansions = isCategory ? categoryExpansions : subcategoryExpansions;
    
    // Get or create expansion animation
    if (!expansions.has(id)) {
      expansions.set(id, new Animated.Value(isExpanding ? 1 : 0));
    }
    const expansion = expansions.get(id)!;
    
    // Animate both rotation and expansion with easing
    Animated.parallel([
      Animated.timing(rotation, {
        toValue: isExpanding ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1), // Material Design easing
      }),
      Animated.timing(expansion, {
        toValue: isExpanding ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1), // Material Design easing
      })
    ]).start();
  };

  // Get expansion style for animated content
  const getExpansionStyle = (id: string, isCategory: boolean, isExpanded?: boolean) => {
    const expansions = isCategory ? categoryExpansions : subcategoryExpansions;
    if (!expansions.has(id)) {
      // Always initialize at 0 - useEffect will animate to correct state
      expansions.set(id, new Animated.Value(0));
    }
    const expansion = expansions.get(id)!;
    
    return {
      opacity: expansion.interpolate({
        inputRange: [0, 0.1, 1],
        outputRange: [0, 0.95, 1], // Fade in aún más gradual y suave
      }),
      maxHeight: expansion.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 10000], // Large enough for all content
      }),
    };
  };

  // Initialize expansion value if already expanded
  const initializeExpansion = (id: string, isCategory: boolean, isExpanded: boolean) => {
    const expansions = isCategory ? categoryExpansions : subcategoryExpansions;
    if (!expansions.has(id)) {
      expansions.set(id, new Animated.Value(isExpanded ? 1 : 0));
    }
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
    categoryExpansions,
    subcategoryExpansions,

    // Functions
    getRotateStyle,
    animateRotation,
    getExpansionStyle,
    initializeExpansion,
    getSelectionAnimation,
    animateSelection,
    getTransactionAnimation,
    animateTransactionSelection,
    batchAnimateSelections,
    batchAnimateTransactionSelections,
  };
}
