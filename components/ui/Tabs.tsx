import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { cn } from '@/lib/utils';

interface Tab {
  key: string;
  label: string;
  badge?: string | number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  return (
    <View className={cn('flex-row border-b border-gray-200', className)}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          className={cn(
            'flex-1 items-center py-4',
            activeTab === tab.key && 'border-b-2 border-primary-500'
          )}
          onPress={() => onTabChange(tab.key)}
        >
          <Text
            className={cn(
              'text-base font-medium',
              activeTab === tab.key ? 'text-primary-500' : 'text-gray-500'
            )}
          >
            {tab.label}
            {tab.badge && (
              <Text className="text-sm bg-gray-200 rounded-full px-3 py-1.5 ml-1">
                {tab.badge}
              </Text>
            )}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
} 