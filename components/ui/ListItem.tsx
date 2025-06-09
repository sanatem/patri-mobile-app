import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { cn } from '@/lib/utils';

interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  value: string | number;
  badge?: {
    text: string;
    variant: 'positive' | 'negative' | 'neutral';
  };
  icon?: {
    component?: React.ReactNode;
    backgroundColor?: string;
    text?: string;
  };
  onPress?: () => void;
}

interface ListProps {
  data: ListItem[];
  initialItemCount?: number;
  loadMoreStep?: number;
  showLoadMore?: boolean;
  onItemPress?: (item: ListItem) => void;
  className?: string;
  itemClassName?: string;
  showSeparators?: boolean;
}

export function ListItem({
  data,
  initialItemCount = 10,
  loadMoreStep = 10,
  showLoadMore = true,
  onItemPress,
  className,
  itemClassName,
  showSeparators = true,
}: ListProps) {
  const [visibleCount, setVisibleCount] = useState(initialItemCount);
  
  const visibleData = data.slice(0, visibleCount);
  const hasMore = visibleCount < data.length;

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + loadMoreStep, data.length));
  };

  const getBadgeColors = (variant: 'positive' | 'negative' | 'neutral') => {
    switch (variant) {
      case 'positive':
        return { backgroundColor: '#dcfce7', color: '#16a34a' };
      case 'negative':
        return { backgroundColor: '#fecaca', color: '#dc2626' };
      case 'neutral':
        return { backgroundColor: '#f3f4f6', color: '#4b5563' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#4b5563' };
    }
  };

  const renderItem = ({ item, index }: { item: ListItem; index: number }) => (
    <TouchableOpacity
      className={cn(
        'flex-row justify-between items-center py-4 px-4',
        itemClassName
      )}
      style={{
        borderBottomWidth: showSeparators && index < visibleData.length - 1 ? 1 : 0,
        borderBottomColor: '#E5E7EB',
      }}
      onPress={() => {
        item.onPress?.();
        onItemPress?.(item);
      }}
      disabled={!item.onPress && !onItemPress}
    >
      <View className="flex-row items-center flex-1">
        {item.icon && (
          <View className="mr-3">
            {item.icon.component ? (
              item.icon.component
            ) : (
              <View
                className="rounded-xl justify-center items-center"
                style={{ 
                  backgroundColor: item.icon.backgroundColor || '#6B7280',
                  width: 40, 
                  height: 40 
                }}
              >
                <Text className="text-white text-base font-semibold">
                  {item.icon.text || item.title.charAt(0)}
                </Text>
              </View>
            )}
          </View>
        )}

        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-800 mb-1">
            {item.title}
          </Text>
          {item.subtitle && (
            <Text className="text-sm text-gray-500 font-regular">
              {item.subtitle}
            </Text>
          )}
        </View>
      </View>

      <View className="items-end">
        <Text className="text-base font-semibold text-gray-800 mb-1">
          {typeof item.value === 'number' 
            ? `$${Math.abs(item.value).toLocaleString('es-CL')}`
            : item.value
          }
        </Text>
        
        {item.badge && (
          <View
            className="rounded-full px-2 py-1 min-w-[50px] items-center"
            style={getBadgeColors(item.badge.variant)}
          >
            <Text
              className="text-xs font-medium"
              style={{ color: getBadgeColors(item.badge.variant).color }}
            >
              {item.badge.text}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View className={cn('', className)}>
      <FlatList
        data={visibleData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        scrollEnabled={false}
      />
      
      {showLoadMore && hasMore && (
        <TouchableOpacity 
          className="items-center py-4 mt-2"
          onPress={loadMore}
        >
          <Text className="text-base font-medium text-primary-500">
            Ver más ({data.length - visibleCount} restantes)
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
} 