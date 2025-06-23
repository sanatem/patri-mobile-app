import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { portfolioHeaderStyles } from '@/styles/investment/PortfolioHeader.styles';

interface PortfolioHeaderProps {
  patrimony: string;
}

export function PortfolioHeader({ patrimony }: PortfolioHeaderProps) {
  return (
    <LinearGradient
      colors={['#FF6503', '#E55A02', '#CC5200']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[portfolioHeaderStyles.gradient]}
    >
      <Text className="text-center text-lg font-bold mb-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
        Patrimonio Neto
      </Text>
      <Text className="text-center text-4xl font-bold mb-6" style={{ color: 'white', letterSpacing: 1 }}>
        {patrimony}
      </Text>
      
    </LinearGradient>
  );
}