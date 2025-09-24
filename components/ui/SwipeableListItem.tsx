import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, Animated, PanResponder } from 'react-native';
import { ChevronRight, Trash2 } from 'lucide-react-native';
import { cn } from '@/lib/utils';
import { listItemStyles } from '@/styles/ui/ListItem.styles';
import Colors from '@/constants/Colors';
import { Button } from '@/components/ui/Button';

interface SwipeableListItem {
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
  onDelete?: () => void;
  customLayout?: boolean;
  subtitleLines?: string[];
  mediumSubtitleIndex?: number;
}

interface SwipeableListProps {
  data: SwipeableListItem[];
  initialItemCount?: number;
  loadMoreStep?: number;
  showLoadMore?: boolean;
  onItemPress?: (item: SwipeableListItem) => void;
  onItemDelete?: (item: SwipeableListItem) => void;
  className?: string;
  itemClassName?: string;
  showSeparators?: boolean;
  showContainer?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  useExternalPagination?: boolean;
  onCollapse?: () => void;
}

const SwipeableItem = ({
  item,
  index,
  onPress,
  onDelete,
  showSeparators,
  itemClassName,
  visibleDataLength
}: {
  item: SwipeableListItem;
  index: number;
  onPress?: (item: SwipeableListItem) => void;
  onDelete?: (item: SwipeableListItem) => void;
  showSeparators: boolean;
  itemClassName?: string;
  visibleDataLength: number;
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const currentOffset = useRef(0);

  React.useEffect(() => {
    return () => {
      translateX.setValue(0);
      currentOffset.current = 0;
    };
  }, [item.id]);
  const showPercentageBadges = false;

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 50;
    },
    onPanResponderGrant: () => {
      translateX.setOffset(currentOffset.current);
      translateX.setValue(0);
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dx < 0) {
        translateX.setValue(gestureState.dx);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      translateX.flattenOffset();

      if (gestureState.dx < -50 || gestureState.vx < -0.5) {
        Animated.spring(translateX, {
          toValue: -80,
          useNativeDriver: false,
        }).start(() => {
          currentOffset.current = -80;
          onDelete?.(item);
        });
      } else {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: false,
        }).start(() => {
          currentOffset.current = 0;
        });
      }
    },
  });

  const handleDelete = () => {
    Animated.spring(translateX, {
      toValue: -300,
      useNativeDriver: false,
    }).start(() => {
      onDelete?.(item);
    });
  };

  const handlePress = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: false,
    }).start(() => {
      item.onPress?.();
      onPress?.(item);
    });
  };

  return (
    <>
      <View style={{ position: 'relative' }}>
        <View style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: 80,
          backgroundColor: 'white',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <TouchableOpacity
            onPress={handleDelete}
            style={{
              width: 80,
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Trash2 size={20} color={Colors.gray[600]} />
          </TouchableOpacity>
        </View>
        <Animated.View
          style={{
            transform: [{ translateX }],
            backgroundColor: 'white',
          }}
          {...panResponder.panHandlers}
        >
            <TouchableOpacity
              className={cn('', itemClassName)}
              style={listItemStyles.row}
              onPress={handlePress}
              disabled={!item.onPress && !onPress}
              activeOpacity={item.onPress || onPress ? 0.85 : 1}
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

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={listItemStyles.value}>
                        {typeof item.value === 'number'
                          ? `$${Math.abs(item.value).toLocaleString('es-CL')}`
                          : item.value
                        }
                      </Text>
                      {(item.onPress || onPress) && (
                        <ChevronRight
                          size={20}
                          color={Colors.gray[400]}
                          style={{ marginLeft: 8 }}
                        />
                      )}
                    </View>
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
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
                  {(item.onPress || onPress) && (
                    <ChevronRight
                      size={20}
                      color={Colors.gray[400]}
                      style={{ marginLeft: 8 }}
                    />
                  )}
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
      </View>
      {showSeparators && index < visibleDataLength - 1 && (
        <View style={listItemStyles.separator} />
      )}
    </>
  );
};

export function SwipeableListItem({
  data,
  initialItemCount = 10,
  loadMoreStep = 10,
  showLoadMore = true,
  onItemPress,
  onItemDelete,
  className,
  itemClassName,
  showSeparators = true,
  showContainer = true,
  onLoadMore,
  hasMore = false,
  loadingMore = false,
  useExternalPagination = false,
  onCollapse,
}: SwipeableListProps) {
  const [visibleCount, setVisibleCount] = React.useState(showLoadMore ? initialItemCount : data.length);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [hasReachedEnd, setHasReachedEnd] = React.useState(false);

  const visibleData = useExternalPagination ? data : (showLoadMore ? data.slice(0, visibleCount) : data);

  const hasMoreData = useExternalPagination ? hasMore : (showLoadMore ? visibleCount < data.length : false);
  const canShowLess = showLoadMore && !useExternalPagination ? visibleCount > initialItemCount : false;

  const canCollapseExternal = useExternalPagination && hasReachedEnd && data.length > initialItemCount;

  React.useEffect(() => {
    if (useExternalPagination && !hasMore && data.length > 0) {
      setHasReachedEnd(true);
    } else if (useExternalPagination && hasMore) {
      setHasReachedEnd(false);
    }
  }, [useExternalPagination, hasMore, data.length]);

  const loadMore = () => {
    if (!showLoadMore) return;

    if (useExternalPagination) {
      onLoadMore?.();
    } else {
      setVisibleCount(prev => Math.min(prev + loadMoreStep, data.length));
      setIsExpanded(true);
    }
  };

  const loadLess = () => {
    if (!showLoadMore) return;
    setVisibleCount(initialItemCount);
    setIsExpanded(false);
  };

  const content = (
    <FlatList
      data={visibleData}
      renderItem={({ item, index }) => (
        <SwipeableItem
          item={item}
          index={index}
          onPress={onItemPress}
          onDelete={onItemDelete}
          showSeparators={showSeparators}
          itemClassName={itemClassName}
          visibleDataLength={visibleData.length}
        />
      )}
      keyExtractor={item => item.id}
      scrollEnabled={false}
    />
  );

  const renderPaginationButtons = () => {
    if (!showLoadMore) return null;

    return (
      <>
        {hasMoreData && (useExternalPagination || !isExpanded) && (
          <Button
            variant="ghost"
            title={loadingMore ? "Cargando..." : "Ver más"}
            onPress={loadMore}
            disabled={loadingMore}
          />
        )}
        {!useExternalPagination && isExpanded && canShowLess && (
          <Button
            variant="ghost"
            title="Ver menos"
            onPress={loadLess}
          />
        )}
        {canCollapseExternal && onCollapse && (
          <Button
            variant="ghost"
            title="Ver menos"
            onPress={onCollapse}
          />
        )}
      </>
    );
  };

  return showContainer ? (
    <View style={[listItemStyles.container, className ? { marginBottom: 0 } : {}]}>
      {content}
      {renderPaginationButtons()}
    </View>
  ) : (
    <>
      {content}
      {renderPaginationButtons()}
    </>
  );
}