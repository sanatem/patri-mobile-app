import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Header } from '@/components/ui/Header';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { ChartSection } from '@/components/investment/portfolio/portfolio-details/ChartSection';
import PortfolioDetailsHeader from '@/components/investment/portfolio/portfolio-details/PortfolioDetailsHeader';
import PortfolioProgress from '@/components/investment/portfolio/portfolio-details/PortfolioProgress';
import PortfolioSummary from '@/components/investment/portfolio/portfolio-details/PortfolioSummary';
import PortfolioAssets from '@/components/investment/portfolio/portfolio-details/PortfolioAssets';
import PortfolioMovements from '@/components/investment/portfolio/portfolio-details/PortfolioMovements';
import { getMovementsByGoal, Movement } from '@/services/investment/get-movements';
import { getPortfolioDetails, MetaDetails } from '@/services/investment/get-portfolio-details';
import Colors from '@/constants/Colors';

export default function PortfolioDetailsScreen() {
  const router = useRouter();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [metaDetails, setMetaDetails] = useState<MetaDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const metaName = 'Emergencias';

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [movementsData, metaData] = await Promise.all([
          getMovementsByGoal(metaName),
          getPortfolioDetails(metaName)
        ]);
        
        setMovements(movementsData);
        setMetaDetails(metaData);
      } catch (error) {
        console.error('Error loading portfolio details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [metaName]);

  if (loading || !metaDetails) {
    return (
      <Container variant="secondaryPage" className="px-3">
        <View className="flex-1 bg-white">
          <Header 
            title="Detalles de la meta" 
            leftAction={
              <TouchableOpacity
                onPress={() => router.push('/investment/portfolio')}
                className="p-1 mr-3"
              >
                <ChevronLeft size={24} color={Colors.primary[500]} />
              </TouchableOpacity>
            }
          />
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500">Cargando...</Text>
          </View>
        </View>
      </Container>
    );
  }

  return (
    <Container variant="secondaryPage" className="px-3">
      <View className="flex-1 bg-white">
        <Header 
          title="Detalles de la meta" 
          leftAction={
            <TouchableOpacity
              onPress={() => router.push('/investment/portfolio')}
              className="p-1 mr-3"
            >
              <ChevronLeft size={24} color={Colors.primary[500]} />
            </TouchableOpacity>
          }
        />
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          <PortfolioDetailsHeader meta={metaDetails} />
          <PortfolioProgress meta={metaDetails} />
          <ChartSection updatedDate="Actualizado al cierre del martes 27 de mayo" />
          <PortfolioSummary summary={metaDetails.summary} />
          <PortfolioAssets assets={metaDetails.assets} />
          <PortfolioMovements movements={movements} />
        </ScrollView>
        <View className="bg-white border-t border-gray-200 p-5 flex-col" style={{ gap: 12 }}>
          <Button title="Retirar" variant="outline" onPress={() => {}} fullWidth />
          <Button title="Depositar" variant="primary" onPress={() => {}} fullWidth />
        </View>
      </View>
    </Container>
  );
}
