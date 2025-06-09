import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight, Users } from 'lucide-react-native';

interface UserSelectorProps {
  selectedView: 'mine' | 'partner' | 'both';
  onViewChange: (view: 'mine' | 'partner' | 'both') => void;
  showSelector: boolean;
  onToggle: () => void;
  myLabel?: string;
  partnerLabel?: string;
}

export function UserSelector({
  selectedView,
  onViewChange,
  showSelector,
  onToggle,
  myLabel = 'GD',
  partnerLabel = 'JM',
}: UserSelectorProps) {
  const options = [
    { id: 'mine', label: myLabel, isActive: selectedView === 'mine' },
    { id: 'partner', label: partnerLabel, isActive: selectedView === 'partner' },
    { id: 'both', label: 'both', isActive: selectedView === 'both' },
  ];

  return (
    <View className="relative">
      <TouchableOpacity
        onPress={onToggle}
        className="flex-row items-center bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200"
      >
        <View className="w-8 h-8 rounded-full border-2 border-primary-500 px-1 items-center justify-center bg-white">
          <Text className="text-xs font-bold text-gray-500">
            {selectedView === 'both' ? 'GD' : selectedView === 'mine' ? myLabel : partnerLabel}
          </Text>
        </View>
        <ChevronRight size={14} color="#9CA3AF" className="ml-2" />
      </TouchableOpacity>

      {showSelector && (
        <View
          className="absolute left-20 flex-row items-center bg-white border border-gray-200 rounded-full px-3 py-2 z-50"
          style={{
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
          }}
        >
          {options.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => onViewChange(item.id as 'mine' | 'partner' | 'both')}
              className={`w-8 h-8 rounded-full items-center justify-center border mx-1 ${
                item.isActive ? 'border-primary-500 bg-white' : 'border-gray-100 bg-white'
              }`}
            >
              {item.id === 'both' ? (
                <Users size={14} color="#4B5563" />
              ) : (
                <Text className="text-[11px] font-bold text-gray-500">{item.label}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
} 