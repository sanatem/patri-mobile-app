import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { cn } from '@/lib/utils';
import { listItemStyles } from '@/styles/ui/ListItem.styles';

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
  customLayout?: boolean;
  subtitleLines?: string[];
  mediumSubtitleIndex?: number;
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
  showContainer?: boolean;
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
  showContainer = true,
}: ListProps) {
  const [visibleCount, setVisibleCount] = useState(initialItemCount);
  const showPercentageBadges = false; // Temporary flag to hide percentage badges
  
  const visibleData = data.slice(0, visibleCount);
  const hasMore = visibleCount < data.length;

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + loadMoreStep, data.length));
  };


  const renderItem = ({ item, index }: { item: ListItem; index: number }) => (
    <>
      <TouchableOpacity
        className={cn('', itemClassName)}
        style={listItemStyles.row}
        onPress={() => {
          item.onPress?.();
          onItemPress?.(item);
        }}
        disabled={!item.onPress && !onItemPress}
        activeOpacity={item.onPress || onItemPress ? 0.85 : 1}
      >
        {item.icon && (
          <View style={[listItemStyles.icon, item.icon.backgroundColor ? { backgroundColor: item.icon.backgroundColor } : {}]}>
            {item.icon.component ? (
              item.icon.component
            ) : (
              <Text style={listItemStyles.iconText}>
                {item.icon.text || item.title.charAt(0)}
              </Text>
            )}
          </View>
        )}
        
        {item.customLayout ? (
          <View style={listItemStyles.info}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={listItemStyles.title}>{item.title}</Text>
                {item.subtitleLines && item.subtitleLines.map((line, lineIndex) => (
                  <Text 
                    key={lineIndex}
                    style={[
                      listItemStyles.subtitle,
                      item.mediumSubtitleIndex === lineIndex && { fontFamily: 'Poppins-Medium' },
                      lineIndex > 0 && { marginTop: 2 }
                    ]}
                  >
                    {line}
                  </Text>
                ))}
                {item.subtitle && !item.subtitleLines && (
                  <Text style={listItemStyles.subtitle}>{item.subtitle}</Text>
                )}
              </View>
              
              <Text style={listItemStyles.value}>
                {typeof item.value === 'number' 
                  ? `$${Math.abs(item.value).toLocaleString('es-CL')}`
                  : item.value
                }
              </Text>
            </View>
          </View>
        ) : (
          <View style={listItemStyles.info}>
            <Text style={listItemStyles.title}>{item.title}</Text>
            {item.subtitle && (
              <Text style={listItemStyles.subtitle}>{item.subtitle}</Text>
            )}
          </View>
        )}
        
        {!item.customLayout && (
          <View style={listItemStyles.valueContainer}>
            <Text style={listItemStyles.value}>
              {typeof item.value === 'number' 
                ? `$${Math.abs(item.value).toLocaleString('es-CL')}`
                : item.value
              }
            </Text>
            {showPercentageBadges && item.badge && (
              <View
                style={[
                  listItemStyles.badge,
                  item.badge.variant === 'positive'
                    ? listItemStyles.badgeBgPositive
                    : item.badge.variant === 'negative'
                    ? listItemStyles.badgeBgNegative
                    : listItemStyles.badgeBgNeutral
                ]}
              >
                <Text
                  style={
                    item.badge.variant === 'positive'
                      ? listItemStyles.badgeArrowPositive
                      : item.badge.variant === 'negative'
                      ? listItemStyles.badgeArrowNegative
                      : listItemStyles.badgeArrowNeutral
                  }
                >
                  {item.badge.variant === 'positive' ? '↑' : item.badge.variant === 'negative' ? '↓' : ''}
                </Text>
                <Text
                  style={
                    item.badge.variant === 'positive'
                      ? listItemStyles.badgeTextPositive
                      : item.badge.variant === 'negative'
                      ? listItemStyles.badgeTextNegative
                      : listItemStyles.badgeTextNeutral
                  }
                >
                  {item.badge.text}
                </Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
      {showSeparators && index < visibleData.length - 1 && (
        <View style={listItemStyles.separator} />
      )}
    </>
  );

  const content = (
    <FlatList
      data={visibleData}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      scrollEnabled={false}
    />
  );

  return showContainer ? (
    <View style={[listItemStyles.container, className ? { marginBottom: 0 } : {}]}>
      {content}
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
  ) : (
    <>
      {content}
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
    </>
  );
} 