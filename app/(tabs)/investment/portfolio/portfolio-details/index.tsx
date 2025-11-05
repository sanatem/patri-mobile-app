import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
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
import { useTranslation } from 'react-i18next';

export default function PortfolioDetailsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
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
          throw new Error('portfolioDetails.error.noGoalId')
        }
        
        if (!accessToken) {
          throw new Error('portfolioDetails.error.noToken')
        }
        
        const [movementsData, metaData] = await Promise.all([
          getMovementsByGoal(goalId, accessToken),
          getPortfolioDetails(goalId, accessToken)
        ]);
        
        setMovements(movementsData);
        setMetaDetails(metaData);
      } catch (error) {
        console.error('Error loading portfolio details:', error);
        setError(error instanceof Error ? error.message : 'portfolioDetails.error.unknown')
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
          title={t('portfolioDetails.title')}
          leftAction={
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/investment/portfolio')}
              className="w-10 h-10 rounded-full justify-center items-center"
            >
              <ChevronLeft size={24} color={Colors.primary[700]} />
            </TouchableOpacity>
          }
        />
        {error ? (
          <View className="flex-1 justify-center items-center px-6">
            <Text className="text-red-500 text-center mb-4">
              {t(error) || error}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/investment/portfolio')}
              className="bg-primary-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white">{t('common.backToPortfolio')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={Colors.secondary[500]} />
          </View>
        )}
      </Container>
    );
  }

  const transformedSummary = [
    { title: t('portfolioDetails.summary.strategy'), value: metaDetails.summary.estrategia },
    { title: t('portfolioDetails.summary.riskLevel'), value: metaDetails.summary.riesgo },
    { title: t('portfolioDetails.summary.invested'), value: `$${Math.round(metaDetails.summary.aportes).toLocaleString('es-CL')}` },
    { title: t('portfolioDetails.summary.withdrawn'), value: `$${Math.round(metaDetails.summary.rescates).toLocaleString('es-CL')}` },
    { title: t('portfolioDetails.summary.variation'), value: `$${Math.round(metaDetails.summary.variacionPesos).toLocaleString('es-CL')}` },
  ];

  const transformedAssets = metaDetails.assets
    .filter(asset => asset.value > 0)
    .map(asset => ({
      name: asset.title,
      percentage: Math.round((asset.value / metaDetails.current) * 100),
      value: `$${Math.round(asset.value).toLocaleString('es-CO')}`,
      allocation: asset.subtitle,
    }));

  return (
    <Container variant="secondaryPage" className="px-1">
      <View className="flex-1 bg-white">
        <Header 
          title={t('portfolioDetails.title')} 
          leftAction={
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/investment/portfolio')}
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
        {false && (
          <PortfolioActionsBar
            actions={[
              {
                title: t('portfolioDetails.actions.invest'),
                onPress: () => router.push('/(tabs)/investment/portfolio/movements/investment'),
                icon: <ArrowDown size={20} color="#fff" />,
                variant: 'primary'
              },
              {
                title: t('portfolioDetails.actions.withdraw'),
                onPress: () => {
                  router.push('/(tabs)/investment/portfolio/movements/sales')
                },
                icon: <ArrowUp size={20} color="#FF5603" />,
                variant: 'outline'
              }
            ]}  
          />
        )}
        </View>
      </View>
    </Container>
  );
}
