import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, Animated, Modal, Pressable, Dimensions, Platform, ScrollView, TextInput } from 'react-native';
import { ChevronDown, Search } from 'lucide-react-native';
import { cn } from '@/lib/utils';
import { inputStyles } from '@/styles/ui/Input.styles';
import { selectStyles, SCREEN_HEIGHT } from '@/styles/ui/Select.styles';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

interface SearchableSelectOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  searchPlaceholder?: string;
}

export function SearchableSelect({
  options,
  value,
  onSelect,
  placeholder,
  label,
  error,
  disabled = false,
  className,
  searchPlaceholder = "Buscar...",
}: SearchableSelectProps) {
  const { t } = useTranslation();
  const placeholderText = placeholder ?? t('common.select_option')
  const [isOpen, setIsOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const borderAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const sheetAnim = useRef(new Animated.Value(0)).current;

  const selectedOption = options.find(option => String(option.value) === String(value ?? ''));

  // Filter options based on search text
  const filteredOptions = useMemo(() => {
    if (!searchText.trim()) return options;
    return options.filter(option =>
      option.label.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [options, searchText]);

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
      setSearchText(''); // Reset search when opening
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
        setSearchText(''); // Reset search when closing
      });
    }
  }, [isOpen]);

  const animatedBorderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? '#DC2626' : Colors.gray[100], Colors.secondary[500]],
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

  const isDisabled = disabled;
  const borderColor = isDisabled ? Colors.gray[100] : (error ? '#DC2626' : animatedBorderColor);
  const labelColor = isDisabled ? Colors.gray[400] : Colors.primary[500];
  const textColor = isDisabled ? Colors.gray[400] : Colors.primary[500];
  const placeholderColor = isDisabled ? Colors.gray[400] : Colors.primary[400];

  return (
    <View className={cn('mb-5 w-full', className)}>
      {label && (
        <Text className="text-base font-medium mb-2" style={{ color: labelColor }}>{label}</Text>
      )}
      <Animated.View
        style={[
          inputStyles.container,
          {
            borderColor: borderColor,
            backgroundColor: '#fff',
            opacity: isDisabled ? 0.6 : 1,
          },
          isDisabled && inputStyles.containerDisabled,
          error && inputStyles.containerError,
        ]}
      >
        <TouchableOpacity
          className="flex-1 flex-row items-center"
          onPress={toggleDropdown}
          activeOpacity={0.7}
          disabled={isDisabled}
        >
          {selectedOption?.icon && (
            <View style={inputStyles.iconContainer}>{selectedOption.icon}</View>
          )}
          <Text
            className={cn(
              'text-base font-regular',
              isDisabled && 'text-gray-400'
            )}
            style={{ 
              flex: 1,
              color: selectedOption ? textColor : placeholderColor,
            }}
          >
            {selectedOption ? selectedOption.label : placeholderText}
          </Text>
          <ChevronDown
            size={18}
            color={isDisabled ? '#D1D5DB' : '#6B7280'}
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
            
            {/* Search Input */}
            <View style={{ 
              marginBottom: 16,
              paddingHorizontal: 16,
              paddingVertical: 12,
              backgroundColor: Colors.gray[50],
              borderRadius: 8,
              borderWidth: 1,
              borderColor: Colors.gray[200],
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              <Search size={18} color={Colors.gray[400]} style={{ marginRight: 8 }} />
              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder={searchPlaceholder}
                placeholderTextColor={Colors.gray[400]}
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: Colors.primary[700],
                  paddingVertical: 0,
                }}
                autoFocus={false}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <ScrollView 
              style={{ maxHeight: 180 }}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {filteredOptions.length === 0 ? (
                <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                  <Text style={{ color: Colors.gray[500], fontSize: 14 }}>
                    No se encontraron resultados
                  </Text>
                </View>
              ) : (
                filteredOptions.map((option, index) => (
                  <TouchableOpacity
                    key={option.value}
                    style={{
                      paddingVertical: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderBottomWidth: index !== filteredOptions.length - 1 ? 1 : 0,
                      borderColor: Colors.primary[100],
                    }}
                    onPress={() => handleSelect(option.value)}
                    activeOpacity={0.7}
                  >
                    {option.icon && <View style={{ marginRight: 12 }}>{option.icon}</View>}
                    <Text
                      className={cn(
                        'text-base',
                        String(option.value) === String(value ?? '') ? 'font-medium' : 'font-regular'
                      )}
                      style={{
                        color: String(option.value) === String(value ?? '') ? Colors.primary[500] : Colors.primary[700]
                      }}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {error && <Text className="text-sm mt-1 font-regular" style={{ color: Colors.error[500] }}>{error}</Text>}
    </View>
  );
}

