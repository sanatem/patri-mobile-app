import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { ChevronLeft, ArrowDown, ArrowUp } from 'lucide-react-native';
import { useRouter } from 'expo-router';
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

export default function PortfolioDetailsScreen() {
  const router = useRouter();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [metaDetails, setMetaDetails] = useState<MetaDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const metaName = 'Emergencias';

  const generateProjectedData = (metaDetails: MetaDetails) => {
    if (!metaDetails) return [];

    const startDate = new Date();
    const endDate = new Date(metaDetails.goalDate.split('/').reverse().join('-'));
    const monthsDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    const monthlyIncrement = (metaDetails.goal - metaDetails.current) / Math.max(monthsDiff, 1);
    const projectedData = [];

    for (let i = 3; i >= 1; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const amount = Math.max(metaDetails.current - (monthlyIncrement * i), 0);
      projectedData.push({
        date: date.toISOString().slice(0, 7),
        amount: amount,
        projected: false
      });
    }

    projectedData.push({
      date: new Date().toISOString().slice(0, 7),
      amount: metaDetails.current,
      projected: false
    });

    for (let i = 1; i <= Math.min(monthsDiff, 8); i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      const amount = Math.min(metaDetails.current + (monthlyIncrement * i), metaDetails.goal);
      projectedData.push({
        date: date.toISOString().slice(0, 7),
        amount: amount,
        projected: true
      });
    }

    return projectedData;
  };

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
      </Container>
    );
  }

  const projectedData = generateProjectedData(metaDetails);

  const transformedSummary = [
    { title: 'Estrategia', value: metaDetails.summary.estrategia },
    { title: 'Nivel de riesgo', value: metaDetails.summary.riesgo },
    { title: 'Aportes', value: `$${metaDetails.summary.aportes.toLocaleString('es-CO')}` },
    { title: 'Rescates', value: `$${metaDetails.summary.rescates.toLocaleString('es-CO')}` },
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
            currentAmount={metaDetails.current}
            targetAmount={metaDetails.goal}
            projectedData={projectedData}
            targetDate={metaDetails.goalDate}
          />
          <PortfolioOverviewSection 
            summary={transformedSummary}
            assets={transformedAssets}
            movements={movements}
            goalName={metaName}
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
