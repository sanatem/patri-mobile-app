import React, { useRef, useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, LayoutChangeEvent } from 'react-native';
import { cn } from '@/lib/utils';
import { tabsStyles } from '@/styles/ui/Tabs.styles';
import Colors from '@/constants/Colors';

interface Tab {
  key: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  const activeIndex = tabs.findIndex(tab => tab.key === activeTab);
  const [containerWidth, setContainerWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  const tabWidth = containerWidth > 0 ? containerWidth / tabs.length : 0;

  return (
    <View style={tabsStyles.card} className={cn('flex-row mb-6', className)} onLayout={onLayout}>
      <View style={{ flexDirection: 'row', width: '100%' }}>
        {tabs.map((tab, idx) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                tabsStyles.tab,
              ]}
              className={cn('flex-1 flex-row items-center justify-center mx-1', isActive ? '' : '')}
              onPress={() => onTabChange(tab.key)}
              activeOpacity={0.85}
            >
              <Text className="text-lg font-medium" style={[
                { color: isActive ? Colors.primary[500] : Colors.gray[300] }
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 1, backgroundColor: Colors.gray[200], width: '100%' }} />
      {containerWidth > 0 && (
        <View
          style={{
            position: 'absolute',
            left: tabWidth * activeIndex,
            bottom: 0,
            width: tabWidth,
            height: 3,
            backgroundColor: Colors.secondary[500],

          }}
        />
      )}
    </View>
  );
} 