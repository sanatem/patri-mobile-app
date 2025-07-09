import React from 'react';
import { View, Text } from 'react-native';
import AdvisorCard from './AdvisorCard';
import { Card, Button } from '@/components/ui';
import { Calendar, MessageSquare } from 'lucide-react-native';
import Colors from '@/constants/Colors';

export interface AdvisorSectionProps {
  onSchedule?: () => void;
  onChat?: () => void;
}

export default function AdvisorSection({ onSchedule, onChat }: AdvisorSectionProps) {
  return (
    <View style={{ padding: 10 }}>
      <AdvisorCard />
      <Card variant="default" className="mb-2 mt-4">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center flex-1">
            <View 
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: Colors.primary[50], width: 40, height: 40 }}
            >
              <Calendar size={18} color={Colors.primary[500]} />
            </View>
            <View className="ml-3">
              <Text className="text-sm font-medium" style={{ color: Colors.primary[500] }}>Próxima reunión</Text>
              <Text className="text-xs font-regular" style={{ color: Colors.gray[500] }}>Ninguna programada</Text>
            </View>
          </View>
          <Button 
            title="Programar" 
            onPress={onSchedule || (() => {})} 
            size="small"
            variant="primary"
          />
        </View>
      </Card>
    </View>
  );
} 