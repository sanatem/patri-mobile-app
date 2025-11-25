import React from 'react';
import { TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Container } from '@/components/ui/Container';
import { Header } from '@/components/ui/Header';
import { ChevronLeft } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import PdfViewerComponent from '@/components/investment/InvestmentOverview/CreateAccount/PdfViewer';

export default function PdfViewerScreen() {
  const handleBackPress = () => {
    router.back();
  };

  return (
    <Container variant="secondaryPage">
      <Header
        title="Normas de conducta"
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
      <PdfViewerComponent />
    </Container>
  );
}
