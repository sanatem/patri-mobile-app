import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  Animated,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { cn } from '@/lib/utils';
import { textareaStyles } from '@/styles/ui/Textarea.styles';
import Colors from '@/constants/Colors';

type TextareaProps = TextInputProps & {
  label?: string;
  error?: string;
  className?: string;
  blurOnSubmit?: boolean;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  onSubmitEditing?: () => void;
  disabled?: boolean;
  showCharacterCount?: boolean;
  maxLength?: number;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
};

export function Textarea({
  label,
  error,
  className,
  blurOnSubmit = false,
  returnKeyType = 'default',
  onSubmitEditing,
  disabled = false,
  showCharacterCount = false,
  maxLength,
  placeholder,
  multiline = true,
  numberOfLines = 4,
  value,
  onChangeText,
  ...props
}: TextareaProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [textValue, setTextValue] = useState(value || '');
  const borderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(borderAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  useEffect(() => {
    setTextValue(value || '');
  }, [value]);

  const animatedBorderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.gray[100], Colors.secondary[500]],
  });

  const handleSubmitEditing = () => {
    if (onSubmitEditing) {
      onSubmitEditing();
    } else if (blurOnSubmit) {
      Keyboard.dismiss();
    }
  };

  const handleChangeText = (text: string) => {
    setTextValue(text);
    if (onChangeText) {
      onChangeText(text);
    }
  };

  const isDisabled = disabled;

  const borderColor = isDisabled 
    ? Colors.gray[100] 
    : error 
      ? '#DC2626' 
      : animatedBorderColor;

  const characterCount = textValue.length;
  const isOverLimit = maxLength && characterCount > maxLength;

  return (
    <View className="mb-5 w-full">
      {label && (
        <Text 
          className="text-base font-medium mb-2" 
          style={{ 
            color: isDisabled ? Colors.gray[400] : Colors.primary[500] 
          }}
        >
          {label}
        </Text>
      )}

      <Animated.View
        style={[
          textareaStyles.container,
          {
            borderColor: borderColor,
            backgroundColor: '#fff',
            opacity: isDisabled ? 0.6 : 1,
          },
        ]}
      >
        <TextInput
          className="flex-1 text-base text-gray-800 font-regular"
          style={[
            textareaStyles.textInput,
            {
              color: isDisabled ? Colors.gray[400] : Colors.primary[800],
            }
          ]}
          placeholderTextColor={isDisabled ? Colors.gray[400] : Colors.primary[400]}
          underlineColorAndroid="transparent"
          editable={!isDisabled}
          onFocus={() => !isDisabled && setIsFocused(true)}
          onBlur={() => !isDisabled && setIsFocused(false)}
          returnKeyType={returnKeyType}
          blurOnSubmit={blurOnSubmit}
          onSubmitEditing={handleSubmitEditing}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical="top"
          value={textValue}
          onChangeText={handleChangeText}
          maxLength={maxLength}
          placeholder={placeholder}
          {...props}
        />
      </Animated.View>

      <View className="flex-row justify-between items-center">
        {error && (
          <Text className="text-sm text-[#DC2626] mt-1 font-regular flex-1">
            {error}
          </Text>
        )}
        
        {showCharacterCount && maxLength && (
          <Text 
            style={[
              textareaStyles.characterCount,
              { color: isOverLimit ? '#DC2626' : '#9CA3AF' }
            ]}
          >
            {characterCount}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
} 