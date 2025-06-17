import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Animated } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { inputStyles } from '@/styles/ui/Input.styles';
import Colors from '@/constants/Colors';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onClear?: () => void;
  className?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  placeholder = 'Buscar...',
  value,
  onChangeText,
  onClear,
  className,
  autoFocus = false,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const currentValue = value !== undefined ? value : internalValue;
  const handleChangeText = onChangeText || setInternalValue;

  useEffect(() => {
    Animated.timing(borderAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const animatedBorderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E5E7EB', '#FF6503'],
  });

  const handleClear = () => {
    handleChangeText('');
    onClear?.();
  };

  return (
    <Animated.View
      style={[
        inputStyles.container,
        {
          borderColor: animatedBorderColor,
          backgroundColor: '#fff',
        },
      ]}
    >
      <Search 
        size={20} 
        color={isFocused ? Colors.primary[500] : Colors.gray[400]} 
        style={inputStyles.iconContainer}
      />
      <TextInput
        style={inputStyles.textInput}
        placeholder={placeholder}
        placeholderTextColor={Colors.gray[400]}
        value={currentValue}
        onChangeText={handleChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoFocus={autoFocus}
      />
      {currentValue.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={inputStyles.rightIconContainer}>
          <X size={20} color={Colors.gray[400]} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
} 