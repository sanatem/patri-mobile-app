import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, LayoutChangeEvent } from 'react-native';
import { ChevronRight, Users } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { userSelectorStyles } from '@/styles/ui/UserSelector.styles';

interface UserSelectorProps {
  selectedView: 'mine' | 'partner' | 'both';
  onViewChange: (view: 'mine' | 'partner' | 'both') => void;
  showSelector: boolean;
  onToggle: () => void;
  myLabel?: string;
  partnerLabel?: string;
  enabled?: boolean;
}

export function UserSelector({
  selectedView,
  onViewChange,
  showSelector,
  onToggle,
  myLabel = 'GD',
  partnerLabel = 'JM',
  enabled = true,
}: UserSelectorProps) {
  const options = [
    { id: 'mine', label: myLabel, isActive: selectedView === 'mine' },
    { id: 'partner', label: partnerLabel, isActive: selectedView === 'partner' },
    { id: 'both', label: 'both', isActive: selectedView === 'both' },
  ];

  const [closedWidth, setClosedWidth] = useState(0);
  const [openWidth, setOpenWidth] = useState(0);
  const [contentReady, setContentReady] = useState(false);
  const widthAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const chevronAnim = useRef(new Animated.Value(0)).current;

  const onClosedLayout = (e: LayoutChangeEvent) => {
    if (closedWidth === 0) {
      setClosedWidth(e.nativeEvent.layout.width);
      widthAnim.setValue(e.nativeEvent.layout.width);
    }
  };
  const onOpenedLayout = (e: LayoutChangeEvent) => {
    if (openWidth === 0) {
      setOpenWidth(e.nativeEvent.layout.width);
      setContentReady(true);
    }
  };

  useEffect(() => {
    if (!enabled) return;
    
    if (showSelector && openWidth > 0 && closedWidth > 0) {
      Animated.parallel([
        Animated.timing(widthAnim, {
          toValue: openWidth,
          duration: 260,
          useNativeDriver: false,
        }),
        Animated.timing(contentAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (!showSelector && openWidth > 0 && closedWidth > 0) {
      Animated.parallel([
        Animated.timing(contentAnim, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(widthAnim, {
          toValue: closedWidth,
          duration: 220,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [showSelector, openWidth, closedWidth, enabled]);

  useEffect(() => {
    if (!enabled) return;
    
    Animated.timing(chevronAnim, {
      toValue: showSelector ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [showSelector, enabled]);

  const chevronRotate = chevronAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const handleSelectOption = async (id: 'mine' | 'partner' | 'both') => {
    if (!enabled) return;
    
    await new Promise((resolve) => {
      Animated.parallel([
        Animated.timing(contentAnim, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(widthAnim, {
          toValue: closedWidth,
          duration: 220,
          useNativeDriver: false,
        }),
      ]).start(() => resolve(null));
    });
    onViewChange(id);
    onToggle();
  };

  const handleToggle = () => {
    if (!enabled) return;
    onToggle();
  };

  const optionsRight = options.filter(opt => !opt.isActive);

  if (!enabled) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={[
          userSelectorStyles.closedCircle,
          { borderColor: Colors.secondary[500] }
        ]}>
          <Text style={userSelectorStyles.closedCircleText}>
            {myLabel}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <Animated.View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        width: widthAnim,
        maxWidth: '100%',
        alignSelf: 'flex-start',
        overflow: 'visible',
        marginLeft: 0,
      }}
    >
      <View
        style={[
          userSelectorStyles.closedContainer,
          {
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            marginRight: 0,
            marginLeft: 0,
            position: 'relative',
            zIndex: 1,
            flexDirection: 'row',
            alignItems: 'center',
          },
        ]}
        onLayout={onClosedLayout}
      >
        <TouchableOpacity
          onPress={handleToggle}
          activeOpacity={enabled ? 0.85 : 1}
          style={{ marginLeft: 0 }}
          disabled={!enabled}
        >
          <View style={[
            userSelectorStyles.closedCircle,
            { borderColor: Colors.secondary[500] }
          ]}>
            {selectedView === 'both' ? (
              <Users size={18} color={Colors.gray[500]} />
            ) : (
              <Text style={userSelectorStyles.closedCircleText}>
                {selectedView === 'mine' ? myLabel : partnerLabel}
              </Text>
            )}
          </View>
        </TouchableOpacity>
        {enabled && (
          <TouchableOpacity
            onPress={handleToggle}
            activeOpacity={0.85}
            style={{ marginLeft: 6 }}
          >
            <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
              <ChevronRight size={18} color={Colors.gray[800]} />
            </Animated.View>
          </TouchableOpacity>
        )}
      </View>

      {enabled && (
        <>
          <View
            style={{
              position: 'absolute',
              opacity: 0,
              zIndex: -1,
              pointerEvents: 'none',
              width: 190,
              minWidth: 140,
            }}
            onLayout={onOpenedLayout}
            pointerEvents="none"
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 20, minWidth: 140, width: 140 }}>
              {optionsRight.map((item) => (
                <View
                  key={item.id}
                  style={[
                    userSelectorStyles.optionCircle,
                    {
                      borderColor: Colors.gray[300],
                      backgroundColor: Colors.segmentedControl.inactiveBg,
                    },
                  ]}
                >
                  {item.id === 'both' ? (
                    <Users size={16} color={Colors.gray[400]} />
                  ) : (
                    <Text style={userSelectorStyles.optionText}>
                      {item.label}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>

          {(openWidth > 0 || showSelector) && showSelector && (
            <Animated.View
              style={[
                userSelectorStyles.openedContainer,
                {
                  flexDirection: 'row',
                  backgroundColor: 'transparent',
                  borderColor: 'transparent',
                  paddingHorizontal: 0,
                  paddingVertical: 0,
                  paddingRight: 20,
                  opacity: contentAnim,
                  transform: [
                    {
                      scale: contentAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.95, 1],
                      }),
                    },
                  ],
                  minWidth: 140,
                  width: openWidth > 0 ? undefined : 140,
                },
              ]}
              pointerEvents={showSelector ? 'auto' : 'none'}
            >
              {optionsRight.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleSelectOption(item.id as 'mine' | 'partner' | 'both')}
                  activeOpacity={0.85}
                  style={[
                    userSelectorStyles.optionCircle,
                    {
                      borderColor: Colors.gray[300],
                      backgroundColor: Colors.segmentedControl.inactiveBg,
                    },
                  ]}
                >
                  {item.id === 'both' ? (
                    <Users size={16} color={Colors.gray[400]} />
                  ) : (
                    <Text style={userSelectorStyles.optionText}>
                      {item.label}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </Animated.View>
          )}
        </>
      )}
    </Animated.View>
  );
} 