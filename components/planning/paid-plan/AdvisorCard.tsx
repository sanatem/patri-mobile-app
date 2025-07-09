import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Calendar, MessageSquare, Star, Award } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { Button, Card } from '@/components/ui';

interface AdvisorCardProps {
  onSchedule?: () => void;
  onChat?: () => void;
}

export default function AdvisorCard({ onSchedule, onChat }: AdvisorCardProps) {
  const advisorImage = 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260';
  
  return (
    <Card variant="elevated" className="m-4 mb-2">
      <View className="flex-row mb-4">
        <View style={{ position: 'relative' }}>
          <Image 
            source={{ uri: advisorImage }} 
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              borderWidth: 3,
              borderColor: Colors.primary[100],
            }}
          />
        </View>
        <View className="ml-4 flex-1 justify-center">
          <View className="flex-row items-center mb-1">
            <Text className="text-lg font-medium" style={{ color: Colors.primary[500] }}>Fernando Slebe</Text>
          </View>
          <Text className="text-sm font-medium mb-0.5" style={{ color: Colors.primary[500] }}>
            Asesor de Inversiones Certificado
          </Text>
          <Text className="text-xs font-regular" style={{ color: Colors.gray[500] }}>+10 años de experiencia</Text>
        </View>
      </View>
      
      <Text className="text-sm font-regular" style={{ color: Colors.gray[700] }}>
        Fernando Slebe es un Asesor de Inversiones acreditado especializado en planificación financiera integral y estrategias de inversión a largo plazo.
      </Text>

    </Card>
  );
} 