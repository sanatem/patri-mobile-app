import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { ListItem } from '@/components/ui/ListItem';
import colors from '@/constants/Colors';
import { ChevronDown } from 'lucide-react-native';

export default function PortfolioAssets({ assets }: { assets: any[] }) {
  return (
    <Card className="mb-4">
      <Text className="text-base font-semibold" style={{ color: colors.primary[500] }}>Activos</Text>
      <ListItem data={assets} showContainer={false} showSeparators={true} />
      <TouchableOpacity className="flex-row items-center justify-center">
        <Text className="text-xs text-center font-regular" style={{ color: colors.primary[500] }}>Ver más activos</Text>
        <ChevronDown size={16} color={colors.primary[500]} />
      </TouchableOpacity>
    </Card>
  );
} 