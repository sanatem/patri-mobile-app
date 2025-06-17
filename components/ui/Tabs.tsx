import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { cn } from '@/lib/utils';
import { tabsStyles } from '@/styles/ui/Tabs.styles';

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
    <View style={tabsStyles.card} className={cn('flex-row mb-6', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[
              tabsStyles.tab,
              isActive ? tabsStyles.tabActive : tabsStyles.tabInactive,
            ]}
            className={cn('flex-1 flex-row items-center justify-center mx-1', isActive ? '' : '')}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.85}
          >
            <Text style={[
              tabsStyles.tabText,
              isActive ? tabsStyles.tabTextActive : tabsStyles.tabTextInactive,
            ]}>
              {tab.label}
            </Text>
            {tab.badge && (
              <View
                style={[
                  tabsStyles.badge,
                  isActive ? tabsStyles.badgeActive : tabsStyles.badgeInactive,
                ]}
              >
                <Text style={{
                  color: isActive ? '#fff' : '#FF6503',
                  fontWeight: 'bold',
                  fontSize: 16,
                  fontFamily: 'Poppins-Bold',
                }}>{tab.badge}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
} 