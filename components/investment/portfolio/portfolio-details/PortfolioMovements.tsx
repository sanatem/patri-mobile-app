import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '@/components/ui/Card';
import colors from '@/constants/Colors';
import PortfolioMovementCard from './PortfolioMovementCard';
import { Movement } from '@/services/investment/get-movements';

interface PortfolioMovementsProps {
  movements: Movement[];
}

export default function PortfolioMovements({ movements }: PortfolioMovementsProps) {
  if (movements.length === 0) {
    return (
      <Card className="mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-base font-semibold" style={{ color: colors.primary[500] }}>Movimientos</Text>
        </View>
        <Text className="text-sm text-gray-500 text-center py-4">No hay movimientos disponibles</Text>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <Text className="text-base text-center font-semibold mb-4" style={{ color: colors.primary[500] }}>Movimientos</Text>
      {movements.map((item, idx) => (
        <React.Fragment key={item.id}>
          <PortfolioMovementCard item={item} />
          {idx < movements.length - 1 && (
            <View
              style={{
                borderBottomWidth: 1,
                borderColor: '#E5E7EB',
                marginVertical: 8,
                marginLeft: 32 
              }}
            />
          )}
        </React.Fragment>
      ))}
    </Card>
  );
} 