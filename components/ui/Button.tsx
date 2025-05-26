import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle
} from 'react-native';
import Colors from '@/constants/Colors';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    let buttonStyle: StyleProp<ViewStyle> = [styles.button];
    
    // Variant styles
    if (variant === 'primary') {
      buttonStyle = [...buttonStyle, styles.primaryButton];
    } else if (variant === 'secondary') {
      buttonStyle = [...buttonStyle, styles.secondaryButton];
    } else if (variant === 'outline') {
      buttonStyle = [...buttonStyle, styles.outlineButton];
    }
    
    // Size styles
    if (size === 'small') {
      buttonStyle = [...buttonStyle, styles.smallButton];
    } else if (size === 'large') {
      buttonStyle = [...buttonStyle, styles.largeButton];
    }
    
    // Disabled state
    if (disabled || loading) {
      buttonStyle = [...buttonStyle, styles.disabledButton];
    }
    
    return buttonStyle;
  };
  
  const getTextStyle = () => {
    let labelStyle: StyleProp<TextStyle> = [styles.buttonText];
    
    // Variant text styles
    if (variant === 'primary') {
      labelStyle = [...labelStyle, styles.primaryText];
    } else if (variant === 'secondary') {
      labelStyle = [...labelStyle, styles.secondaryText];
    } else if (variant === 'outline') {
      labelStyle = [...labelStyle, styles.outlineText];
    }
    
    // Size text styles
    if (size === 'small') {
      labelStyle = [...labelStyle, styles.smallText];
    } else if (size === 'large') {
      labelStyle = [...labelStyle, styles.largeText];
    }
    
    // Disabled state
    if (disabled || loading) {
      labelStyle = [...labelStyle, styles.disabledText];
    }
    
    return labelStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' ? Colors.primary[500] : 'white'} 
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  primaryButton: {
    backgroundColor: Colors.primary[500],
  },
  secondaryButton: {
    backgroundColor: Colors.gray[900],
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary[500],
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    height: 36,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    height: 48,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    height: 56,
  },
  disabledButton: {
    backgroundColor: Colors.gray[300],
    borderColor: Colors.gray[300],
  },
  buttonText: {
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  primaryText: {
    color: 'white',
  },
  secondaryText: {
    color: 'white',
  },
  outlineText: {
    color: Colors.primary[500],
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  disabledText: {
    color: Colors.gray[500],
  },
});

export default Button;