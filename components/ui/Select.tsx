import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { cn } from '@/lib/utils';

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

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (optionValue: string) => {
    onSelect(optionValue);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <View className={cn("relative", className)}>
      {label && (
        <Text className="text-sm font-medium text-gray-700 mb-2">
          {label}
        </Text>
      )}
      
      <TouchableOpacity
        className={cn(
          "bg-gray-50 rounded-lg p-3 border border-gray-200",
          disabled && "opacity-50",
          error && "border-red-500",
          isOpen && "border-primary-500"
        )}
        onPress={toggleDropdown}
        activeOpacity={0.7}
        disabled={disabled}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center flex-1">
            {selectedOption?.icon && (
              <View className="mr-2">{selectedOption.icon}</View>
            )}
            <Text className={cn(
              "text-base",
              selectedOption ? "text-gray-900 font-medium" : "text-gray-500"
            )}>
              {selectedOption?.label || placeholder}
            </Text>
          </View>
          
          <ChevronDown 
            size={18} 
            color="#6B7280"
            style={{ 
              transform: [{ rotate: isOpen ? '180deg' : '0deg' }] 
            }}
          />
        </View>
      </TouchableOpacity>

      {isOpen && (
        <View 
          className="absolute top-full left-0 right-0 bg-white rounded-lg mt-1 border border-gray-200 shadow-lg z-50"
          style={{ 
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          }}
        >
          {options.map((option, index) => (
            <TouchableOpacity
              key={option.value}
              className={cn(
                "py-3 px-4 flex-row items-center",
                index !== options.length - 1 && "border-b border-gray-100",
                option.value === value && "bg-primary-50"
              )}
              onPress={() => handleSelect(option.value)}
              activeOpacity={0.7}
            >
              {option.icon && (
                <View className="mr-3">{option.icon}</View>
              )}
              <Text className={cn(
                "text-base",
                option.value === value ? "text-primary-600 font-medium" : "text-gray-900"
              )}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {error && (
        <Text className="text-sm text-red-600 mt-1">{error}</Text>
      )}
    </View>
  );
} 