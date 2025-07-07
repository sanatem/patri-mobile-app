import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ViewStyle,
} from 'react-native';
import Colors from '@/constants/Colors';
import { createStyles } from '@/styles/ui/InfiniteCarousel.styles'

export interface CarouselOption {
  label: string;
  value: string;
}

export interface CarouselColors {
  background?: string;
  border?: string;
  activeBg?: string;
  activeText?: string;
  inactiveBg?: string;
  inactiveText?: string;
}

interface InfiniteCarouselProps {
  options: CarouselOption[];
  value: string;
  onChange: (value: string) => void;
  style?: ViewStyle;
  colors?: CarouselColors;
}

const defaultColors: CarouselColors = {
  background: Colors.segmentedControl.background,
  border: Colors.segmentedControl.border,
  activeBg: Colors.segmentedControl.activeBg,
  activeText: Colors.segmentedControl.activeText,
  inactiveBg: Colors.segmentedControl.inactiveBg,
  inactiveText: Colors.segmentedControl.inactiveText,
};

const MARGIN_HORIZONTAL_TOTAL = 4;
const ANIMATION_TIMEOUT = 200;
const MAX_VISIBLE_ITEMS = 3;
const MIN_ITEM_WIDTH = 100;
const MAX_ITEM_WIDTH = 130;
const CONTAINER_PADDING = 64;

export const InfiniteCarousel: React.FC<InfiniteCarouselProps> = ({
  options,
  value,
  onChange,
  style,
  colors = {},
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollViewWidth, setScrollViewWidth] = useState(0);
  const [itemWidth, setItemWidth] = useState(120);
  const [isInitialized, setIsInitialized] = useState(false);

  // Memoizar colores y estilos
  const mergedColors = useMemo(() => ({ ...defaultColors, ...colors }), [colors]);
  const styles = useMemo(() => createStyles(mergedColors, itemWidth), [mergedColors, itemWidth]);

  const infiniteOptions = useMemo(() => [...options, ...options, ...options], [options]);
  const activeIndex = options.findIndex(option => option.value === value);
  const centerSetIndex = options.length;

  const calculateScrollPosition = (targetIndex: number) => {
    const totalItemWidth = itemWidth + MARGIN_HORIZONTAL_TOTAL * 2;
    return targetIndex * totalItemWidth;
  };

  const centerActiveItem = (animated: boolean = true) => {
    if (!scrollViewRef.current || scrollViewWidth === 0) return;

    const targetIndex = centerSetIndex + activeIndex;
    const scrollToX = calculateScrollPosition(targetIndex);

    scrollViewRef.current.scrollTo({
      x: Math.max(0, scrollToX),
      animated,
    });
  };

  useEffect(() => {
    if (scrollViewRef.current && scrollViewWidth > 0 && !isInitialized) {
      setTimeout(() => {
        centerActiveItem(false);
        setIsInitialized(true);
      }, ANIMATION_TIMEOUT);
    }
  }, [scrollViewWidth, itemWidth, activeIndex, centerSetIndex, isInitialized]);

  useEffect(() => {
    if (scrollViewRef.current && scrollViewWidth > 0 && isInitialized) {
      centerActiveItem(true);
    }
  }, [value, isInitialized]);

  const handleScroll = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    const currentX = contentOffset.x;
    const totalItemWidth = itemWidth + MARGIN_HORIZONTAL_TOTAL * 2;
    const totalWidth = infiniteOptions.length * totalItemWidth;
    const oneSetWidth = options.length * totalItemWidth;

    if (currentX <= 0) {
      scrollViewRef.current?.scrollTo({
        x: oneSetWidth,
        animated: false,
      });
    } else if (currentX >= totalWidth - scrollViewWidth) {
      scrollViewRef.current?.scrollTo({
        x: oneSetWidth,
        animated: false,
      });
    }
  };

  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setScrollViewWidth(width);

    const calculatedItemWidth = Math.max(
      MIN_ITEM_WIDTH,
      Math.min(MAX_ITEM_WIDTH, (width - CONTAINER_PADDING) / MAX_VISIBLE_ITEMS)
    );
    setItemWidth(calculatedItemWidth);
  };

  const renderOption = (option: CarouselOption, index: number) => {
    const isActive = value === option.value;

    return (
      <TouchableOpacity
        key={`${option.value}-${index}`}
        style={[
          styles.option,
          isActive ? styles.optionActive : styles.optionInactive,
        ]}
        activeOpacity={0.8}
        onPress={() => onChange(option.value)}
      >
        <Text
          style={[
            styles.textBase,
            isActive ? styles.textActive : styles.textInactive,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit={!isActive}
        >
          {option.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const scrollViewPadding = Math.max(0, (scrollViewWidth - itemWidth) / 2);

  return (
    <View style={[styles.container, style]} onLayout={handleLayout}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: scrollViewPadding,
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        style={styles.scrollView}
      >
        {infiniteOptions.map((option, index) => renderOption(option, index))}
      </ScrollView>
    </View>
  );
}; 