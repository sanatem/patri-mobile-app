import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Modal, Pressable, Dimensions, Platform, ScrollView } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { cn } from '@/lib/utils';
import { inputStyles } from '@/styles/ui/Input.styles';
import { selectStyles, SCREEN_HEIGHT } from '@/styles/ui/Select.styles';
import Colors from '@/constants/Colors';

interface SelectOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function Select({
  options,
  value,
  onSelect,
  placeholder = "Selecciona una opción",
  label,
  error,
  disabled = false,
  className,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const sheetAnim = useRef(new Animated.Value(0)).current;

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    Animated.timing(borderAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setModalVisible(true);
      Animated.parallel([
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(sheetAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (modalVisible) {
      Animated.parallel([
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(sheetAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setModalVisible(false);
      });
    }
  }, [isOpen]);

  const animatedBorderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? '#DC2626' : '#ECECEC', '#FF6503'],
  });

  const handleSelect = (optionValue: string) => {
    onSelect(optionValue);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const overlayStyle = [
    selectStyles.overlay,
    {
      backgroundColor: overlayAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.45)'],
      }),
    },
  ];

  const sheetStyle = [
    selectStyles.modalSheet,
    {
      transform: [
        {
          translateY: sheetAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [SCREEN_HEIGHT, 0],
          }),
        },
      ],
    },
  ];

  return (
    <View className={cn('mb-5 w-full', className)}>
      {label && (
        <Text className="text-base font-medium mb-2" style={{ color: Colors.primary[500] }}>{label}</Text>
      )}
      <Animated.View
        style={[
          inputStyles.container,
          {
            borderColor: error ? '#DC2626' : animatedBorderColor,
            backgroundColor: disabled ? '#F3F4F6' : '#fff',
          },
        ]}
      >
        <TouchableOpacity
          className="flex-1 flex-row items-center"
          onPress={toggleDropdown}
          activeOpacity={0.7}
          disabled={disabled}
        >
          {selectedOption?.icon && (
            <View style={inputStyles.iconContainer}>{selectedOption.icon}</View>
          )}
          <Text
            className={cn(
              'text-base font-regular',
              selectedOption ? 'text-gray-700 font-regular' : 'text-gray-500',
              disabled && 'text-gray-400'
            )}
            style={{ flex: 1 }}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
          <ChevronDown
            size={18}
            color={disabled ? '#D1D5DB' : '#6B7280'}
            style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
          />
        </TouchableOpacity>
      </Animated.View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Animated.View style={overlayStyle}>
            <Pressable style={{ flex: 1 }} onPress={() => setIsOpen(false)} />
          </Animated.View>
          <Animated.View style={sheetStyle}>
            <View style={selectStyles.dragIndicatorContainer}>
              <View style={selectStyles.dragIndicator} />
            </View>
            {label && (
              <Text className="text-base font-medium mb-4" style={{ color: Colors.primary[500] }}>{label}</Text>
            )}
            <ScrollView 
              style={{ maxHeight: 180 }}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {options.map((option, index) => (
                <TouchableOpacity
                  key={option.value}
                  style={{
                    paddingVertical: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderBottomWidth: index !== options.length - 1 ? 1 : 0,
                    borderColor: '#F3F4F6',
                  }}
                  onPress={() => handleSelect(option.value)}
                  activeOpacity={0.7}
                >
                  {option.icon && <View style={{ marginRight: 12 }}>{option.icon}</View>}
                  <Text
                    className={cn(
                      'text-base',
                      option.value === value ? 'text-primary-500 font-medium' : 'font-regular text-gray-700'
                    )}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {error && <Text className="text-sm mt-1 font-regular" style={{ color: Colors.error[500] }}>{error}</Text>}
    </View>
  );
} 