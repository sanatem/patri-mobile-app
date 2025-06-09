import React, { useState } from 'react';
import { View, TouchableOpacity, Text, FlatList, Modal } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { cn } from '@/lib/utils';

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  options: DropdownOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Dropdown({
  options,
  selectedValue,
  onSelect,
  placeholder = 'Seleccionar...',
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(option => option.value === selectedValue);

  const handleSelect = (value: string) => {
    onSelect(value);
    setIsOpen(false);
  };

  return (
    <>
      <View className={cn('relative', className)}>
        {/* Trigger */}
        <TouchableOpacity
          className="flex-row items-center justify-center bg-gray-100 px-4 py-2 rounded-full"
          onPress={() => setIsOpen(!isOpen)}
        >
          <Text className="text-base font-medium text-gray-800 mr-1">
            {selectedOption?.label || placeholder}
          </Text>
          <ChevronDown 
            size={16} 
            color="#9CA3AF" 
            style={{
              transform: [{ rotate: isOpen ? '180deg' : '0deg' }]
            }}
          />
        </TouchableOpacity>
      </View>
      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
          >
            <View 
              className="bg-white rounded-xl border border-gray-200 max-h-60 min-w-[200px] mx-8"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.25,
                shadowRadius: 16,
                elevation: 20,
              }}
            >
              <FlatList
                data={options}
                keyExtractor={(item) => item.value}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    className={cn(
                      'px-4 py-3',
                      index < options.length - 1 && 'border-b border-gray-100'
                    )}
                    onPress={() => handleSelect(item.value)}
                    style={{ 
                      backgroundColor: selectedValue === item.value ? '#fff7ed' : '#ffffff',
                      borderTopLeftRadius: index === 0 ? 12 : 0,
                      borderTopRightRadius: index === 0 ? 12 : 0,
                      borderBottomLeftRadius: index === options.length - 1 ? 12 : 0,
                      borderBottomRightRadius: index === options.length - 1 ? 12 : 0,
                    }}
                  >
                    <Text
                      className={cn(
                        'text-base font-medium text-center',
                        selectedValue === item.value ? 'text-primary-600' : 'text-gray-800'
                      )}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
} 