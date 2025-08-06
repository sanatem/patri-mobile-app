import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Colors from '@/constants/Colors';

interface RadioButtonOption {
  label: string;
  value: string;
}

interface RadioButtonProps {
  label?: string;
  options: RadioButtonOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export default function RadioButton({
  label,
  options,
  selectedValue,
  onSelect,
  disabled = false,
  error
}: RadioButtonProps) {
  return (
    <View>
      {label && (
        <Text 
          className='text-base font-medium'
          style={{
            color: Colors.primary[500],
            marginBottom: 12,
          }}
        >
          {label}
        </Text>
      )}
      
      <View style={{ gap: 12 }}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              opacity: disabled ? 0.5 : 1,
            }}
            onPress={() => !disabled && onSelect(option.value)}
            disabled={disabled}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: selectedValue === option.value 
                  ? Colors.primary[500] 
                  : Colors.gray[300],
                marginRight: 12,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'transparent',
              }}
            >
              {selectedValue === option.value && (
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: Colors.primary[500],
                  }}
                />
              )}
            </View>
            
            <Text
              style={{
                fontSize: 16,
                color: Colors.gray[700],
                flex: 1,
              }}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {error && (
        <Text
          style={{
            color: Colors.error[500],
            fontSize: 14,
            marginTop: 8,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}