import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import Colors from '@/constants/Colors';

interface MovementDetails {
  tipo: string;
  metodo: string;
  portafolio: string;
  estado: string;
}

interface Movement {
  id: string;
  title: string;
  subtitle: string;
  value: number;
  type: 'deposit' | 'withdrawal';
  details?: MovementDetails;
}

interface PortfolioMovementsCardProps {
  title: string;
  movements: Movement[];
  goalName?: string;
}

export default function PortfolioMovementsCard({ title, movements, goalName }: PortfolioMovementsCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push('/investment/portfolio/portfolio-details/movements' as any);
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Card className="mb-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Text className="text-base font-medium" style={{ color: Colors.primary[500] }}>Movimientos</Text>
          </View>
          <ChevronRight size={20} color={Colors.gray[500]} />
        </View>
      </Card>
    </TouchableOpacity>
  );
} 