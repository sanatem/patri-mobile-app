import React from 'react';
import { View } from 'react-native';
import { SkeletonBase } from '@/components/ui/SkeletonBase';

interface ChartSkeletonProps {
  chartSize: number;
}

export function ChartSkeleton({ chartSize }: ChartSkeletonProps) {
  return (
    <View style={{
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      alignItems: 'center'
    }}>
      <SkeletonBase
        width={chartSize}
        height={chartSize}
        x={0}
        y={0}
        rows={1}
        rowHeight={chartSize}
        rowWidth={chartSize}
        borderRadius={chartSize / 2}
        style={{ borderRadius: chartSize / 2 }}
      />
    </View>
  );
}
