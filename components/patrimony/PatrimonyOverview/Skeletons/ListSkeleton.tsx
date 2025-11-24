import React from 'react';
import { View, Animated } from 'react-native';
import { SkeletonBase } from '@/components/ui/SkeletonBase';

interface ListSkeletonProps {
  skeletonFadeAnim: Animated.Value;
  itemCount?: number;
}

export function ListSkeleton({ skeletonFadeAnim, itemCount = 6 }: ListSkeletonProps) {
  return (
    <Animated.View style={{ padding: 20, opacity: skeletonFadeAnim }}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <View key={index} style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#f3f4f6'
        }}>
          <SkeletonBase
            width={48}
            height={48}
            x={0}
            y={0}
            rows={1}
            rowHeight={48}
            rowWidth={48}
            borderRadius={12}
            style={{ marginRight: 16 }}
          />
          <View style={{ flex: 1, marginRight: 16 }}>
            <SkeletonBase
              width={200}
              height={40}
              x={0}
              y={0}
              rows={2}
              rowHeight={20}
              rowWidth={200}
              rowSpacing={4}
              borderRadius={4}
            />
          </View>
          <SkeletonBase
            width={100}
            height={20}
            x={0}
            y={0}
            rows={1}
            rowHeight={20}
            rowWidth={100}
            borderRadius={4}
          />
        </View>
      ))}
    </Animated.View>
  );
}
