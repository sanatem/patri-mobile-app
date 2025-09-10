import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { ChevronLeft, ArrowUp, ArrowDown } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Header } from '@/components/ui/Header';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { getMovementsByGoal, Movement } from '@/services/investment/portfolio/movements/get-movements';
import { useAuth } from '@/providers/AuthProvider';
import Colors from '@/constants/Colors';
import { SkeletonBase } from '@/components/ui/SkeletonBase';
import { useTranslation } from 'react-i18next';

export default function MovementsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { goalId, goalName } = useLocalSearchParams<{ goalId: string; goalName: string }>();
  
  const { accessToken } = useAuth();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleBackPress = () => {
    if (!goalId || goalId.trim() === '') {
      console.warn('goalId está vacío, navegando al portfolio principal');
      router.push('/investment/portfolio');
      return;
    }
    
    const safeGoalId = goalId.trim();
    const safeGoalName = goalName || '';
    
    router.replace({
      pathname: '/investment/portfolio/portfolio-details',
      params: {
        goalId: safeGoalId,
        goalName: safeGoalName,
      },
    } as any);
  };

  useEffect(() => {
    const loadMovements = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const movementsData = await getMovementsByGoal(goalId, accessToken || undefined);
        setMovements(movementsData);
      } catch (err) {
        console.error('Error loading movements:', err);
        setError(err instanceof Error ? err.message : 'Error cargando movimientos');
      } finally {
        setLoading(false);
      }
    };

    loadMovements();
  }, [goalId, accessToken]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getMovementIcon = (type: 'deposit' | 'withdrawal') => {
    if (type === 'deposit') {
      return <ArrowDown size={20} color={Colors.success[500]} />;
    }
    return <ArrowUp size={20} color={Colors.error[500]} />;
  };

  const renderMovementItem = ({ item }: { item: Movement }) => (
    <Card className="mb-2">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          {getMovementIcon(item.type)}
          <View className="ml-3 flex-1">
            <Text className="text-base font-medium" style={{ color: Colors.primary[500] }}>
              {item.title}
            </Text>
            <Text className="text-sm font-regular" style={{ color: Colors.gray[500] }}>
              {item.subtitle}
            </Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-lg font-medium" style={{ color: Colors.primary[500] }}>
            {formatCurrency(item.value)}
          </Text>
          {item.details && (
            <Text className="text-xs font-regular" style={{ color: Colors.gray[500] }}>
              {item.details.portafolio}
            </Text>
          )}
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <Container variant="secondaryPage">
        <Header 
          title={t('movements.title')} 
          leftAction={
            <TouchableOpacity
              onPress={handleBackPress}
              className="w-10 h-10 rounded-full justify-center items-center"
            >
              <ChevronLeft size={24} color={Colors.primary[700]} />
            </TouchableOpacity>
          }
        />
        <View style={{ padding: 20 }}>
          {Array.from({ length: 5 }).map((_, index) => (
            <View key={index} style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              paddingVertical: 18,
              paddingHorizontal: 20,
              backgroundColor: '#fff',
              borderBottomWidth: 1,
              borderBottomColor: '#f3f4f6',
              marginBottom: 8,
              borderRadius: 8
            }}>
              <SkeletonBase
                width={20}
                height={20}
                x={0}
                y={0}
                rows={1}
                rowHeight={20}
                rowWidth={20}
                borderRadius={10}
                style={{ marginRight: 12 }}
              />
              <View style={{ flex: 1, marginRight: 12 }}>
                <SkeletonBase
                  width={200}
                  height={40}
                  x={0}
                  y={0}
                  rows={2}
                  rowHeight={20}
                  rowWidth={200}
                  rowSpacing={4}
                  borderRadius={4}
                />
              </View>
              <SkeletonBase
                width={80}
                height={20}
                x={0}
                y={0}
                rows={1}
                rowHeight={20}
                rowWidth={80}
                borderRadius={4}
              />
            </View>
          ))}
        </View>
      </Container>
    );
  }

  if (error) {
    return (
      <Container variant="secondaryPage">
        <Header 
          title={t('movements.title')} 
          leftAction={
            <TouchableOpacity
              onPress={handleBackPress}
              className="p-1 mr-3"
            >
              <ChevronLeft size={24} color={Colors.primary[500]} />
            </TouchableOpacity>
          }
        />
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-red-500 text-center mb-4">{t(error) || error}</Text>
          <TouchableOpacity
            onPress={handleBackPress}
            className="bg-primary-500 px-4 py-2 rounded-lg"
          >
            <Text className="text-white">{t('common.back')}</Text>
          </TouchableOpacity>
        </View>
      </Container>
    );
  }

  return (
    <Container variant="secondaryPage">
      <Header 
        title={t('movements.title')} 
        leftAction={
          <TouchableOpacity
            onPress={handleBackPress}
            className="p-1 mr-3"
          >
            <ChevronLeft size={24} color={Colors.primary[500]} />
          </TouchableOpacity>
        }
      />
      <View className="flex-1 px-4 py-2">
        {movements.length > 0 ? (
          <FlatList
            data={movements}
            renderItem={renderMovementItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <View className="flex-1 justify-center items-center py-8">
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              {t('movements.emptyTitle')}
            </Text>
            <Text className="text-sm text-gray-600 text-center">
              {t('movements.emptySubtitle')}
            </Text>
          </View>
        )}
      </View>
    </Container>
  );
} 