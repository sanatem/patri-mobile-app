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
    <Card variant="default" className="m-4 mb-2">
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
          <View style={{
            position: 'absolute',
            bottom: 2,
            right: 2,
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: '#ffffff',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <View style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: Colors.success[500],
            }} />
          </View>
          <View 
            className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full items-center justify-center"
            style={{ backgroundColor: Colors.primary[500] }}
          >
            <Award size={12} color="#ffffff" />
          </View>
        </View>
        
        <View className="ml-4 flex-1 justify-center">
          <View className="flex-row items-center mb-1">
            <Text className="text-lg font-bold text-gray-800 mr-2">Fernando Slebe</Text>
            <View className="flex-row items-center bg-yellow-100 px-1.5 py-0.5 rounded-lg">
              <Star size={14} color="#F59E0B" fill="#F59E0B" />
              <Text className="text-xs font-semibold text-yellow-600 ml-1">4.9</Text>
            </View>
          </View>
          <Text className="text-sm font-medium mb-0.5" style={{ color: Colors.primary[600] }}>
            Asesor de Inversiones Certificado
          </Text>
          <Text className="text-xs text-gray-500 font-regular">+10 años de experiencia</Text>
        </View>
      </View>
      
      <Text className="text-sm text-gray-700 leading-5 mb-5 font-regular">
        Fernando Slebe es un Asesor de Inversiones acreditado especializado en planificación financiera integral y estrategias de inversión a largo plazo.
      </Text>
      
      <View className="border-t border-gray-100 pt-4 mb-4">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center flex-1">
            <View 
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: Colors.gray[50] }}
            >
              <Calendar size={18} color={Colors.primary[500]} />
            </View>
            <View className="ml-3">
              <Text className="text-sm font-semibold text-gray-800">Próxima reunión</Text>
              <Text className="text-xs text-gray-500 mt-0.5 font-regular">Ninguna programada</Text>
            </View>
          </View>
          <Button 
            title="Programar" 
            onPress={onSchedule || (() => {})} 
            size="small"
            variant="ghost"
          />
        </View>
      </View>
      
      <View className="border-t border-gray-100 pt-4">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center flex-1">
            <View 
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: Colors.gray[50] }}
            >
              <MessageSquare size={18} color={Colors.secondary[500]} />
            </View>
            <View className="ml-3">
              <Text className="text-sm font-semibold text-gray-800">Bandeja de entrada</Text>
              <Text className="text-xs text-gray-500 mt-0.5 font-regular">No hay mensajes nuevos</Text>
            </View>
          </View>
          <Button
            title="Chat" 
            onPress={onChat || (() => {})} 
            size="small"
            variant="ghost"
          />
        </View>
      </View>
    </Card>
  );
} 