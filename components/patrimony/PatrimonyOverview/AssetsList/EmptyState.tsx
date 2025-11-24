import React from 'react';
import { View, Text } from 'react-native';
import { Plus } from 'lucide-react-native';
import { Button } from '@/components/ui';
import Colors from '@/constants/Colors';

interface EmptyStateProps {
  activeTab: 'assets' | 'liabilities';
  onAddPress: () => void;
  titleKey: string;
  subtitleKey: string;
  buttonTextKey: string;
}

export function EmptyState({
  activeTab,
  onAddPress,
  titleKey,
  subtitleKey,
  buttonTextKey
}: EmptyStateProps) {
  return (
    <View style={{ padding: 40, alignItems: 'center' }}>
      <Text className="font-regular text-base" style={{
        color: Colors.primary[500],
        textAlign: 'center',
        marginBottom: 8
      }}>
        {titleKey}
      </Text>
      <Text className="font-regular text-sm" style={{
        color: Colors.gray[500],
        textAlign: 'center',
        marginBottom: 12
      }}>
        {subtitleKey}
      </Text>
      <Button className="mt-4"
        variant="primary"
        onPress={onAddPress}
        title={buttonTextKey}
        icon={<Plus size={20} color="white" />}
      />
    </View>
  );
}
