import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface CheckboxOption {
  label: string;
  value: string;
}

interface CheckboxProps {
  label?: string;
  options: CheckboxOption[];
  selectedValues: string[];
  onSelect: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export default function Checkbox({
  label,
  options,
  selectedValues,
  onSelect,
  disabled = false,
  error
}: CheckboxProps) {
  const isSelected = (value: string) => selectedValues.includes(value);

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
        {options.map((option) => {
          const selected = isSelected(option.value);

          return (
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
                  borderColor: selected
                    ? Colors.primary[500]
                    : Colors.gray[300],
                  marginRight: 12,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: selected ? Colors.primary[500] : 'transparent',
                }}
              >
                {selected && (
                  <Check size={12} color="white" strokeWidth={3} />
                )}
              </View>

              <Text
                className='text-base font-regular'
                style={{ color: Colors.gray[700] }}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
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
