import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CircleCheck, Lock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui';
import Colors from '@/constants/Colors';
import { Card } from './Card';

interface LockedTabOverlayProps {
  tabName: string;
}

export default function LockedTabOverlay({ tabName }: LockedTabOverlayProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    router.push('/(tabs)/planning');
  };

  return (
    <View className="flex-1 bg-white justify-center items-center px-6">
      <View className="items-center">
        <View className="w-20 h-20 bg-gray-100 rounded-full justify-center items-center mb-6">
          <Lock size={32} color={Colors.secondary[500]} />
        </View>
        <Text className="text-2xl font-medium text-gray-800 mb-5 text-center">
          {tabName}
        </Text>
        <Text className="text-base font-regular text-center mb-8 leading-6" style={{ color: Colors.gray[600] }}>
          Suscríbete a un plan y accede a todas las funcionalidades premium.
        </Text>

        <Card className="mt-5 rounded-lg p-4 w-full">
          <Text className="text-sm font-regular text-gray-600 text-center">
             Con una suscripción premium tendrás acceso completo a:
          </Text>
          <View className="mt-3 space-y-2">
            <View className="flex-row items-center">
              <CircleCheck size={16} color={Colors.secondary[500]} />
              <Text className="text-sm font-regular ml-2" style={{ color: Colors.gray[600] }}>Análisis detallado de patrimonio.</Text>
            </View>
            <View className="flex-row items-center">
              <CircleCheck size={16} color={Colors.secondary[500]} />
              <Text className="text-sm font-regular ml-2" style={{ color: Colors.gray[600] }}>Gestión avanzada de presupuestos.</Text>
            </View>
            <View className="flex-row items-center">
              <CircleCheck size={16} color={Colors.secondary[500]} />
              <Text className="text-sm font-regular ml-2" style={{ color: Colors.gray[600] }}>Acceder a Cuenta de inversion si posees una.</Text>
            </View>
          </View>
        </Card>
        <View className="mt-8 w-full">
        <Button
            title="Suscribirme"
            onPress={handleUpgrade}
            variant="primary"
            size="large"
          />
        </View>
      </View>
    </View>
  );
} 