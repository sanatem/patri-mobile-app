import React from 'react';
import { Text } from 'react-native';
import { Card } from '@/components/ui/Card';
import { ListItem } from '@/components/ui/ListItem';
import colors from '@/constants/Colors';
import { Plus } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';

export default function PortfolioAssets({ assets }: { assets: any[] }) {
  return (
    <Card className="mb-4">
      <Text className="text-base text-center font-semibold" style={{ color: colors.primary[500] }}>Activos</Text>
      <ListItem data={assets} showContainer={false} showSeparators={true} />
      <Button icon={<Plus size={20} color={colors.secondary[500]} />} title=" Ver más activos" variant="outline" onPress={() => {}} className="w-full"/>
    </Card>
  );
} 