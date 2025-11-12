import React from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Plus } from 'lucide-react-native';
import Colors from '@/constants/Colors';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface AddItemModalProps {
  visible: boolean;
  modalVisible: boolean;
  overlayAnim: Animated.Value;
  slideAnim: Animated.Value;
  onClose: () => void;
  onAddAsset: () => void;
  onAddLiability: () => void;
  addAssetLabel: string;
  addLiabilityLabel: string;
}

export function AddItemModal({
  visible,
  modalVisible,
  overlayAnim,
  slideAnim,
  onClose,
  onAddAsset,
  onAddLiability,
  addAssetLabel,
  addLiabilityLabel
}: AddItemModalProps) {
  if (!modalVisible) return null;

  const options = [
    { label: addAssetLabel, value: 'activo', icon: <Plus size={20} color={Colors.gray[700]} /> },
    { label: addLiabilityLabel, value: 'pasivo', icon: <Plus size={20} color={Colors.gray[700]} /> }
  ];

  const handleOptionPress = (optionValue: string) => {
    onClose();
    switch (optionValue) {
      case 'activo':
        onAddAsset();
        break;
      case 'pasivo':
        onAddLiability();
        break;
    }
  };

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'flex-end',
        zIndex: 1000
      }}
    >
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'black',
          opacity: overlayAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.45],
          }),
        }}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>
      <Animated.View
        style={{
          backgroundColor: '#fff',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 32,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [SCREEN_HEIGHT, 0],
              }),
            },
          ],
        }}
      >
        <View style={{ alignItems: 'center', paddingVertical: 8 }}>
          <View style={{ width: 40, height: 4, backgroundColor: '#D1D5DB', borderRadius: 2 }} />
        </View>
        {options.map((option, index) => (
          <TouchableOpacity
            key={option.value}
            style={{
              paddingVertical: 16,
              flexDirection: 'row',
              alignItems: 'center',
              borderBottomWidth: index !== options.length - 1 ? 1 : 0,
              borderColor: '#F3F4F6',
            }}
            onPress={() => handleOptionPress(option.value)}
            activeOpacity={0.7}
          >
            {option.icon && (
              <View style={{ marginRight: 12 }}>{option.icon}</View>
            )}
            <Text className="text-base font-regular" style={{ color: Colors.gray[700] }}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </View>
  );
}
