import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import { ArrowUpCircle, ArrowDownCircle, ChevronDown } from 'lucide-react-native';
import colors from '@/constants/Colors';

interface MovementDetails {
  tipo: string;
  metodo: string;
  portafolio: string;
  estado: string;
}

interface MovementItem {
  id: string;
  title: string;
  subtitle: string;
  value: number;
  type: 'deposit' | 'withdrawal';
  details?: MovementDetails;
}

interface PortfolioMovementCardProps {
  item: MovementItem;
}

export default function PortfolioMovementCard({ item }: PortfolioMovementCardProps) {
  const [expanded, setExpanded] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: expanded ? 1 : 0,
      duration: 200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [expanded, rotateAnim]);

  const handleExpand = () => {
    setExpanded(!expanded);
  };

  const getMovementIcon = (type: string) => {
    if (type === 'deposit') {
      return <ArrowUpCircle size={16} color={colors.success[500]} />;
    } else if (type === 'withdrawal') {
      return <ArrowDownCircle size={16} color={colors.error[500]} />;
    }
    return null;
  };

  const getMovementColor = (type: string) => {
    if (type === 'deposit') {
      return colors.success[500];
    } else if (type === 'withdrawal') {
      return colors.error[500];
    }
    return colors.gray[700];
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <TouchableOpacity
      onPress={handleExpand}
      activeOpacity={0.85}
      style={{ marginBottom: 0 }}
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center flex-1">
          {getMovementIcon(item.type)}
          <View className="ml-2 flex-1">
            <Text className="text-sm font-medium" style={{ color: colors.gray[700] }}>{item.title}</Text>
            <Text className="text-xs font-regular" style={{ color: colors.gray[500] }}>{item.subtitle}</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          <Text 
            className="text-base font-regular" 
            style={{ color: getMovementColor(item.type) }}
          >
            ${item.value.toLocaleString('es-CL')}
          </Text>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <ChevronDown 
              className="px-1"
              size={20} 
              color={colors.gray[700]} 
            />
          </Animated.View>
        </View>
      </View>
      {expanded && (
        item.details ? (
          <View className="mt-2 pl-1">
            <Text className="text-xs mb-1">Tipo: <Text className="text-gray-700 font-medium">{item.details.tipo}</Text></Text>
            <Text className="text-xs mb-1">Método de pago: <Text className="text-gray-700 font-medium">{item.details.metodo}</Text></Text>
            <Text className="text-xs mb-1">Portafolio: <Text className="text-gray-700 font-medium">{item.details.portafolio}</Text></Text>
            <Text className="text-xs mb-1">Estado: <Text className="text-gray-700 font-medium">{item.details.estado}</Text></Text>
          </View>
        ) : (
          <View className="mt-2 pl-1">
            <Text className="text-xs font-regular" style={{ color: colors.gray[500] }}>Sin detalles disponibles</Text>
          </View>
        )
      )}
    </TouchableOpacity>
  );
} 