import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Line } from 'react-native-svg';

interface ChartSectionProps {
  updatedDate?: string;
}

export function ChartSection({ updatedDate }: ChartSectionProps) {
  return (
    <View className="mb-6">
      <View className="bg-white rounded-2xl h-60 mb-4 overflow-hidden">
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 300 240"
          preserveAspectRatio="none"
        >
          <Line x1="0" y1="200" x2="300" y2="200" stroke="#E5E7EB" strokeWidth="1" />
          <Path
            d="M 0 200 L 50 180 L 100 160 L 150 130 L 200 100 L 250 60 L 300 40 L 300 200 Z"
            fill="rgba(255, 86, 3, 0.1)"
          />
          <Path
            d="M 0 200 L 50 180 L 100 160 L 150 130 L 200 100 L 250 60 L 300 40"
            stroke="#FF5603"
            strokeWidth="3"
            fill="none"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
      
      {updatedDate && (
        <Text className="text-xs text-gray-500 text-center">
          {updatedDate}
        </Text>
      )}
    </View>
  );
}