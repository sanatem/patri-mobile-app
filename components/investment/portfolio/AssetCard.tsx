import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import Colors from '@/constants/Colors';
import { ChevronDown } from 'lucide-react-native';

interface AssetCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  value: string;
  isSelected: boolean;
  onSelect: () => void;
  showRadioButton?: boolean;
  additionalInfo?: string;
  isExpandable?: boolean;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  showDate?: boolean;
  showValue?: boolean;
}

export default function AssetCard({
  title,
  subtitle,
  description,
  value,
  isSelected,
  onSelect,
  showRadioButton = true,
  additionalInfo,
  isExpandable = false,
  isExpanded = false,
  onToggleExpanded,
  showDate = false,
  showValue = true
}: AssetCardProps) {
  const [rotateAnim] = useState(new Animated.Value(isExpanded ? 1 : 0));
  const [expandAnim] = useState(new Animated.Value(isExpanded ? 1 : 0));
  const borderColorAnim = useRef(new Animated.Value(isSelected ? 1 : 0)).current;

  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('es-CL');
  };
  useEffect(() => {
    const toValue = isExpanded ? 1 : 0;

    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(expandAnim, {
        toValue,
        duration: 250,
        useNativeDriver: false,
      })
    ]).start();
  }, [isExpanded, rotateAnim, expandAnim]);

  useEffect(() => {
    Animated.timing(borderColorAnim, {
      toValue: isSelected ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isSelected, borderColorAnim]);

  const toggleExpanded = () => {
    if (onToggleExpanded) {
      onToggleExpanded();
    }
  };

  const rotateStyle = {
    transform: [
      {
        rotate: rotateAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
  };

  const expandStyle = {
    opacity: expandAnim,
    maxHeight: expandAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 200],
    }),
  };

  const borderColorStyle = {
    borderColor: borderColorAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [Colors.gray[100], Colors.primary[500]],
    }),
  };
  if (!isExpandable) {
    return (
      <TouchableOpacity onPress={onSelect}>
        <Animated.View
          style={[
            {
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              borderWidth: 1,
            },
            borderColorStyle,
          ]}
        >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          {showRadioButton && (
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: isSelected
                  ? Colors.primary[500]
                  : Colors.gray[200],
                marginRight: 12,
                marginTop: 2,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'transparent',
              }}
            >
              {isSelected && (
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: Colors.primary[500],
                  }}
                />
              )}
            </View>
          )}

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text className='font-medium text-sm'
                  style={{
                    color: Colors.primary[500],
                    marginBottom: 4,
                  }}
                >
                  {title}
                </Text>

                {subtitle && (
                  <Text className='font-regular text-xs'
                    style={{
                      color: Colors.primary[500],
                      marginBottom: 4,
                    }}
                  >
                    {subtitle}
                  </Text>
                )}

                {description && (
                  <Text
                    className='font-regular text-xs'
                    style={{
                      color: Colors.gray[600],
                      marginBottom: 4,
                    }}
                  >
                    {description}
                  </Text>
                )}

                {additionalInfo && (
                  <Text
                    className='font-regular text-xs'
                    style={{
                      color: Colors.gray[500],
                    }}
                  >
                    {additionalInfo}
                  </Text>
                )}
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                {showValue && (
                  <Text
                    className='font-medium text-base'
                    style={{
                      color: Colors.primary[500],
                    }}
                  >
                    {value}
                  </Text>
                )}
                {showDate && (
                  <Text
                    className='font-regular text-xs'
                    style={{
                      color: Colors.gray[500],
                      marginTop: 2,
                    }}
                  >
                    Al {getCurrentDate()}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View
      style={[
        {
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
        },
        borderColorStyle,
      ]}
    >
      <TouchableOpacity onPress={onSelect}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          {showRadioButton && (
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: isSelected
                  ? Colors.primary[500]
                  : Colors.gray[200],
                marginRight: 12,
                marginTop: 2,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'transparent',
              }}
            >
              {isSelected && (
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: Colors.primary[500],
                  }}
                />
              )}
            </View>
          )}

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text className='font-medium text-sm'
                  style={{
                    color: Colors.primary[500],
                    marginBottom: 4,
                  }}
                >
                  {title}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {showValue && (
                  <View style={{ alignItems: 'flex-end', marginRight: 8 }}>
                    <Text className='font-medium text-base'
                      style={{
                        color: Colors.primary[500],
                      }}
                    >
                      {value}
                    </Text>
                    {showDate && (
                      <Text className='font-regular text-xs'
                        style={{
                          color: Colors.gray[500],
                          marginTop: 2,
                        }}
                      >
                        Al {getCurrentDate()}
                      </Text>
                    )}
                  </View>
                )}

                <TouchableOpacity onPress={toggleExpanded} style={{ padding: 4 }}>
                  <Animated.View style={[rotateStyle]}>
                    <ChevronDown size={20} color={Colors.primary[500]} />
                  </Animated.View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      <Animated.View style={[expandStyle, { overflow: 'hidden' }]}>
        <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.gray[100] }}>
          {subtitle && (
            <Text className='font-medium text-xs'
              style={{
                color: Colors.primary[500],
                marginBottom: 4,
              }}
            >
              {subtitle}
            </Text>
          )}

          {description && (
            <Text className='font-regular text-xs'
              style={{
                color: Colors.gray[600],
                marginBottom: 4,
              }}
            >
              {description}
            </Text>
          )}

          {additionalInfo && (
            <Text
              className='font-regular text-xs'
              style={{
                color: Colors.gray[500],
              }}
            >
              {additionalInfo}
            </Text>
          )}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

