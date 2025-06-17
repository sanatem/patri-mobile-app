import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { cn } from '@/lib/utils';
import { inputStyles } from '@/styles/ui/Input.styles';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  className?: string;
};

export function Input({
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  editable = true,
  className,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

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

  return (
    <View className="mb-5 w-full">
      {label && (
        <Text className="text-base font-semibold text-gray-700 mb-2">{label}</Text>
      )}

      <Animated.View
        style={[
          inputStyles.container,
          {
            borderColor: error ? '#DC2626' : animatedBorderColor,
            backgroundColor: editable ? '#F9FAFB' : '#F3F4F6',
          },
        ]}
      >
        {icon && <View style={inputStyles.iconContainer}>{icon}</View>}

        <TextInput
        className="flex-1 text-base text-gray-800 font-regular "
          style={inputStyles.textInput}
          placeholderTextColor="#9CA3AF"
          underlineColorAndroid="transparent"
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        
          {...props}
        />

        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={inputStyles.rightIconContainer}>
            {rightIcon}
          </TouchableOpacity>
        )}
      </Animated.View>

      {error && <Text className="text-sm text-[#DC2626] mt-1 font-regular">{error}</Text>}
    </View>
  );
}
