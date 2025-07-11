import React from 'react';
import { View, Text } from 'react-native';
import Colors from '@/constants/Colors';
import { useCash } from '@/hooks/patrimony/useCash';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface PortfolioHeaderProps {
  patrimony: string;
  isLoading?: boolean;
}

export function PortfolioHeader({ patrimony, isLoading }: PortfolioHeaderProps) {
  const { cashData, loading: cashLoading, error } = useCash();

  const getCashDisplayValue = () => {
    if (cashLoading) {
      return null;
    }

    if (error || !cashData) {
      return '$0';
    }

    return `${Math.floor(cashData.cash.total_amount).toLocaleString('es-CL')}`;
  };

  const cashDisplayValue = getCashDisplayValue();

  return (
    <View className="bg-gray-100 rounded-lg p-4">
      <Text className="text-center text-lg font-regular mb-2" style={{ color: Colors.primary[500] }}>
        Patrimonio Neto
      </Text>
      {isLoading ? (
        <View className="flex-row justify-center items-center py-2">
          <LoadingSpinner size="small" color={Colors.primary[500]} />
        </View>
      ) : (
        <Text className="text-center font-medium mb-2" style={{ fontSize: 32, color: Colors.primary[700], letterSpacing: 1 }}>
          ${patrimony}
        </Text>
      )}

      <Text className="text-center text-lg font-regular mb-1" style={{ color: Colors.gray[600] }}>
        Saldo en caja
      </Text>
      {cashLoading ? (
        <View className="flex-row justify-center items-center py-2">
          <LoadingSpinner size="small" color={Colors.primary[500]} />
        </View>
      ) : (
        <Text className="text-center font-medium" style={{ fontSize: 32, color: Colors.primary[600] }}>
          ${cashDisplayValue}
        </Text>
      )}
    </View>
  );
}