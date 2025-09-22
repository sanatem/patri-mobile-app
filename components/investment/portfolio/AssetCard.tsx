import React, { useState, useEffect } from 'react';
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

  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('es-CL');
  };

  // Sync animations when isExpanded prop changes
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
        useNativeDriver: false, // height animations require useNativeDriver: false
      })
    ]).start();
  }, [isExpanded, rotateAnim, expandAnim]);

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
      outputRange: [0, 200], // Adjust max height as needed
    }),
  };
  if (!isExpandable) {
    // Non-expandable card (for portfolio options like "Todo mi portafolio", "Retiro proporcional")
    return (
      <TouchableOpacity
        onPress={onSelect}
        style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: isSelected ? Colors.secondary[500] : Colors.gray[200],
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        }}
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
                  ? Colors.secondary[500]
                  : Colors.gray[300],
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
                    backgroundColor: Colors.secondary[500],
                  }}
                />
              )}
            </View>
          )}

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: Colors.primary[700],
                    marginBottom: 4,
                  }}
                >
                  {title}
                </Text>

                {subtitle && (
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '500',
                      color: Colors.primary[500],
                      marginBottom: 4,
                    }}
                  >
                    {subtitle}
                  </Text>
                )}

                {description && (
                  <Text
                    style={{
                      fontSize: 14,
                      color: Colors.gray[600],
                      marginBottom: 4,
                    }}
                  >
                    {description}
                  </Text>
                )}

                {additionalInfo && (
                  <Text
                    style={{
                      fontSize: 12,
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
                    style={{
                      fontSize: 16,
                      fontWeight: '700',
                      color: Colors.primary[700],
                    }}
                  >
                    {value}
                  </Text>
                )}
                {showDate && (
                  <Text
                    style={{
                      fontSize: 12,
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
      </TouchableOpacity>
    );
  }

  // Expandable card (for individual funds)
  return (
    <View
      style={{
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: isSelected ? Colors.secondary[500] : Colors.gray[200],
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      {/* Main selectable area */}
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
                  ? Colors.secondary[500]
                  : Colors.gray[300],
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
                    backgroundColor: Colors.secondary[500],
                  }}
                />
              )}
            </View>
          )}

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: Colors.primary[700],
                    marginBottom: 4,
                  }}
                >
                  {title}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {showValue && (
                  <View style={{ alignItems: 'flex-end', marginRight: 8 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '700',
                        color: Colors.primary[700],
                      }}
                    >
                      {value}
                    </Text>
                    {showDate && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: Colors.gray[500],
                          marginTop: 2,
                        }}
                      >
                        Al {getCurrentDate()}
                      </Text>
                    )}
                  </View>
                )}

                {/* Expand/collapse button */}
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

      {/* Expanded content */}
      <Animated.View style={[expandStyle, { overflow: 'hidden' }]}>
        <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.gray[100] }}>
          {subtitle && (
            <Text
              style={{
                fontSize: 12,
                fontWeight: '500',
                color: Colors.primary[500],
                marginBottom: 4,
              }}
            >
              {subtitle}
            </Text>
          )}

          {description && (
            <Text
              style={{
                fontSize: 14,
                color: Colors.gray[600],
                marginBottom: 4,
              }}
            >
              {description}
            </Text>
          )}

          {additionalInfo && (
            <Text
              style={{
                fontSize: 12,
                color: Colors.gray[500],
              }}
            >
              {additionalInfo}
            </Text>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

