import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { cn } from '@/lib/utils';
import { inputStyles } from '@/styles/ui/Input.styles';
import Colors from '@/constants/Colors';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  rightIconStyle?: any;
  rightIconDisabled?: boolean;
  className?: string;
  blurOnSubmit?: boolean;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  onSubmitEditing?: () => void;
};

export function Input({
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  editable = true,
  className,
  rightIconStyle,
  rightIconDisabled,
  blurOnSubmit = true,
  returnKeyType = 'done',
  onSubmitEditing,
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
    outputRange: ['#ECECEC', '#FF6503'],
  });

  const handleSubmitEditing = () => {
    if (onSubmitEditing) {
      onSubmitEditing();
    } else if (blurOnSubmit) {
      Keyboard.dismiss();
    }
  };

  return (
    <View className="mb-5 w-full">
      {label && (
        <Text className="text-base font-medium mb-2" style={{ color: Colors.gray[700] }}>{label}</Text>
      )}

      <Animated.View
        style={[
          inputStyles.container,
          {
            borderColor: error ? '#DC2626' : animatedBorderColor,
            backgroundColor: '#fff',
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
          returnKeyType={returnKeyType}
          blurOnSubmit={blurOnSubmit}
          onSubmitEditing={handleSubmitEditing}
          clearButtonMode="never"
        
          {...props}
        />

        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={[inputStyles.rightIconContainer, rightIconStyle]} disabled={rightIconDisabled}>
            {rightIcon}
          </TouchableOpacity>
        )}
      </Animated.View>

      {error && <Text className="text-sm text-[#DC2626] mt-1 font-regular">{error}</Text>}
    </View>
  );
}
