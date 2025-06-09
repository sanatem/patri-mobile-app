import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { cn } from '@/lib/utils';

interface CarouselCardProps {
  title: string;
  description: string;
  badge?: {
    text: string;
    icon?: React.ReactNode;
    bgColor?: string;
    textColor?: string;
  };
  onPress?: () => void;
  width?: number;
  height?: number;
  className?: string;
}

export function CarouselCard({
  title,
  description,
  badge,
  onPress,
  width = 280,
  height = 180,
  className,
}: CarouselCardProps) {
  return (
    <TouchableOpacity
      className={cn('bg-white rounded-2xl p-5', className)}
      onPress={onPress}
      style={{
        width,
        height,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      {badge && (
        <View
          className="flex-row items-center self-start px-3 py-1.5 rounded-xl mb-3"
          style={{
            backgroundColor: badge.bgColor || '#f3f4f6', padding: 8, margin: 10, alignSelf: 'flex-start', flexShrink: 1
          }}
        >
          {badge.icon && <View className="mr-2">{badge.icon}</View>}
          <Text
            className="text-xs font-medium"
            style={{
              color: badge.textColor || '#6b7280',
            }}
          >
            {badge.text}
          </Text>
        </View>
      )}

      <Text className="text-xl font-semibold text-gray-800 mb-1.5" style={{ paddingLeft: 10, paddingRight: 10 }}>
        {title}
      </Text>

      <Text className="text-sm text-gray-600 leading-4 font-regular" style={{ paddingLeft: 10, paddingRight: 10, paddingBottom: 5, paddingTop: 5 }}>
        {description}
      </Text>
    </TouchableOpacity>
  );
} 