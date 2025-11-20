import React from 'react';
import { TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Container } from '@/components/ui/Container';
import { Header } from '@/components/ui/Header';
import { ChevronLeft } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import SpouseInformationQuestion from '@/components/investment/InvestmentOverview/CreateAccount/SpouseInformation/SpouseInformationQuestion';

export default function SpouseInformationScreen() {
  const handleBackPress = () => {
    router.back();
  };

  return (
    <Container variant="secondaryPage">
      <Header
        title="Datos del Cónyuge"
        showBackButton={false}
        leftAction={
          <TouchableOpacity
            onPress={handleBackPress}
            className="p-1 mr-3"
          >
            <ChevronLeft size={24} color={Colors.primary[600]} />
          </TouchableOpacity>
        }
      />
      <SpouseInformationQuestion />
    </Container>
  );
}
