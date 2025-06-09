import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { cn } from '@/lib/utils';
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

  const currentValue = value !== undefined ? value : internalValue;
  const handleChangeText = onChangeText || setInternalValue;

  const handleClear = () => {
    handleChangeText('');
    onClear?.();
  };

  return (
    <View
      className={cn(
        'flex-row items-center bg-gray-50 rounded-xl px-4 h-12 border',
        isFocused ? 'border-primary-500 bg-white' : 'border-gray-200',
        className
      )}
    >
      <Search 
        size={20} 
        color={isFocused ? Colors.primary[500] : Colors.gray[400]} 
        className="mr-3" 
      />
      <TextInput
        className="flex-1 text-base font-regular text-gray-800"
        placeholder={placeholder}
        placeholderTextColor={Colors.gray[400]}
        value={currentValue}
        onChangeText={handleChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoFocus={autoFocus}
      />
      {currentValue.length > 0 && (
        <TouchableOpacity onPress={handleClear} className="ml-2">
          <X size={20} color={Colors.gray[400]} />
        </TouchableOpacity>
      )}
    </View>
  );
} 