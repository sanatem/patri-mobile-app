import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Settings, Plus } from 'lucide-react-native';
import { Header as UIHeader, UserSelector } from '@/components/ui';
import Colors from '@/constants/Colors';

interface PatrimonyHeaderProps {
  title: string;
  ownerView: 'mine' | 'partner' | 'both';
  showSelector: boolean;
  userInitials: string;
  onToggleSelector: () => void;
  onViewChange: (view: 'mine' | 'partner' | 'both') => void;
  onPlusPress: () => void;
  onSettingsPress: () => void;
  userSelectorEnabled: boolean;
}

export function PatrimonyHeader({
  title,
  ownerView,
  showSelector,
  userInitials,
  onToggleSelector,
  onViewChange,
  onPlusPress,
  onSettingsPress,
  userSelectorEnabled
}: PatrimonyHeaderProps) {
  return (
    <UIHeader
      title={title}
      leftAction={
        <UserSelector
          selectedView={ownerView}
          onViewChange={onViewChange}
          showSelector={showSelector}
          onToggle={onToggleSelector}
          myLabel={userInitials}
          partnerLabel="P"
          enabled={userSelectorEnabled}
        />
      }
      rightAction={
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={onPlusPress}
            className="mr-3"
          >
            <Plus size={24} color={Colors.primary[500]} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onSettingsPress}>
            <Settings size={24} color={Colors.primary[500]} />
          </TouchableOpacity>
        </View>
      }
    />
  );
}
