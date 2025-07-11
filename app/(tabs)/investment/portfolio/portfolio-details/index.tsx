import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { ChevronLeft, ArrowDown, ArrowUp } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Header } from '@/components/ui/Header';
import { Container } from '@/components/ui/Container';
import { 
  PortfolioDetailsHeader, 
  PortfolioOverviewSection, 
  GoalProgressChart 
} from '@/components/investment/portfolio/portfolio-details';
import { getMovementsByGoal, Movement } from '@/services/investment/portfolio/movements/get-movements';
import { getPortfolioDetails, MetaDetails } from '@/services/investment/portfolio/portfolio-details/get-portfolio-details';
import Colors from '@/constants/Colors';
import { PortfolioActionsBar } from '@/components/investment/portfolio/PortfolioActionsBar';
import { useAuth } from '@/providers/AuthProvider';

export default function PortfolioDetailsScreen() {
  const router = useRouter();
  const { goalId, goalName } = useLocalSearchParams<{ goalId: string; goalName: string }>();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [metaDetails, setMetaDetails] = useState<MetaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { accessToken } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!goalId) {
          throw new Error('ID de meta no proporcionado');
        }
        
        if (!accessToken) {
          throw new Error('No hay token de autenticación disponible');
        }
        
        const [movementsData, metaData] = await Promise.all([
          getMovementsByGoal(goalId, accessToken),
          getPortfolioDetails(goalId, accessToken)
        ]);
        
        setMovements(movementsData);
        setMetaDetails(metaData);
      } catch (error) {
        console.error('Error loading portfolio details:', error);
        setError(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (goalId && accessToken) {
      loadData();
    }
  }, [goalId, accessToken]);

  if (loading || !metaDetails) {
    return (
      <Container variant="secondaryPage">
          <Header 
            title="Detalles de la meta" 
            leftAction={
              <TouchableOpacity
                onPress={() => router.push('/investment/portfolio')}
                className="w-10 h-10 rounded-full justify-center items-center"
              >
                <ChevronLeft size={24} color={Colors.primary[700]} />
              </TouchableOpacity>
            }
          />
          {error && (
            <View className="flex-1 justify-center items-center px-6">
              <Text className="text-red-500 text-center mb-4">{error}</Text>
              <TouchableOpacity
                onPress={() => router.push('/investment/portfolio')}
                className="bg-primary-500 px-4 py-2 rounded-lg"
              >
                <Text className="text-white">Volver al portfolio</Text>
              </TouchableOpacity>
            </View>
          )}
      </Container>
    );
  }

  const transformedSummary = [
    { title: 'Estrategia', value: metaDetails.summary.estrategia },
    { title: 'Nivel de riesgo', value: metaDetails.summary.riesgo },
    { title: 'Aportes', value: `$${metaDetails.summary.aportes.toLocaleString('es-CO')}` },
    { title: 'Rescates', value: `$${metaDetails.summary.rescates.toLocaleString('es-CO')}` },
    { title: 'Variación', value: metaDetails.summary.variacion },
  ];

  const transformedAssets = metaDetails.assets.map(asset => ({
    name: asset.title,
    percentage: Math.round((asset.value / metaDetails.current) * 100),
    value: `$${asset.value.toLocaleString('es-CO')}`,
    allocation: asset.subtitle,
  }));

  return (
    <Container variant="secondaryPage" className="px-1">
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
        <ScrollView className="flex-1 px-3" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          <PortfolioDetailsHeader meta={metaDetails} />
          <GoalProgressChart
            goalId={goalId}
            currentAmount={metaDetails.current}
            targetAmount={metaDetails.goal}
            targetDate={metaDetails.goalDate}
          />
          <PortfolioOverviewSection 
            summary={transformedSummary}
            assets={transformedAssets}
            movements={movements}
            goalName={goalName || metaDetails.name}
            goalId={goalId}
          />
        </ScrollView>
        <View className="px-3">
        <PortfolioActionsBar
          actions={[
            {
              title: 'Invertir',
              onPress: () => router.push('/investment/portfolio/movements/investment' as any),
              icon: <ArrowDown size={20} color="#fff" />,
              variant: 'primary'
            },
            {
              title: 'Retirar',
              onPress: () => {
                router.push('/investment/portfolio/movements/sales' as any);
              },
              icon: <ArrowUp size={20} color="#FF5603" />,
              variant: 'outline'
            }
            ]}  
          />
        </View>
      </View>
    </Container>
  );
}
