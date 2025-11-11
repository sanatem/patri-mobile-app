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
  horizontal?: boolean;
}

export default function RadioButton({
  label,
  options,
  selectedValue,
  onSelect,
  disabled = false,
  error,
  horizontal = false
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
      
      <View style={{
        flexDirection: horizontal ? 'row' : 'column',
        gap: 12
      }}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              opacity: disabled ? 0.5 : 1,
              flex: horizontal ? 1 : undefined,
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
                marginTop: 2,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'transparent',
                flexShrink: 0,
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
              className='text-base font-regular'
              style={{
                color: Colors.gray[700],
                flex: 1,
                flexWrap: 'wrap'
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