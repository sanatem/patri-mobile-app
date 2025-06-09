import React from 'react';
import { View, ScrollView, ViewStyle } from 'react-native';
import { cn } from '@/lib/utils';

interface CarouselProps {
  data: any[];
  renderItem: ({ item, index }: { item: any; index: number }) => React.ReactNode;
  horizontal?: boolean;
  showsScrollIndicator?: boolean;
  contentContainerStyle?: any;
  className?: string;
  style?: ViewStyle | ViewStyle[];
  itemSpacing?: number;
}

export function Carousel({
  data,
  renderItem,
  horizontal = true,
  showsScrollIndicator = false,
  contentContainerStyle,
  className,
  style,
  itemSpacing = 16,
}: CarouselProps) {
  return (
    <View className={cn('', className)} style={style}>
      <ScrollView
        horizontal={horizontal}
        showsHorizontalScrollIndicator={showsScrollIndicator}
        showsVerticalScrollIndicator={showsScrollIndicator}
        contentContainerStyle={[
          {
            paddingLeft: horizontal ? 16 : 0,
            paddingRight: horizontal ? 16 : 0,
          },
          contentContainerStyle,
        ]}
      >
        {data.map((item, index) => (
          <View
            key={item.id || index}
            style={{
              marginRight: horizontal && index < data.length - 1 ? itemSpacing : 0,
              marginBottom: !horizontal && index < data.length - 1 ? itemSpacing : 0,
            }}
          >
            {renderItem({ item, index })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
} 