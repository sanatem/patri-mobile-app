import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { ChevronLeft, ArrowUp, ArrowDown } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Header } from '@/components/ui/Header';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getMovementsByGoal, Movement } from '@/services/investment/portfolio/movements/get-movements';
import { useAuth } from '@/providers/AuthProvider';
import Colors from '@/constants/Colors';

export default function MovementsScreen() {
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
          title="Movimientos" 
          leftAction={
            <TouchableOpacity
              onPress={handleBackPress}
              className="w-10 h-10 rounded-full justify-center items-center"
            >
              <ChevronLeft size={24} color={Colors.primary[700]} />
            </TouchableOpacity>
          }
        />
        <View className="flex-1 justify-center items-center">
          <LoadingSpinner />
          <Text className="text-gray-600 mt-2">Cargando movimientos...</Text>
        </View>
      </Container>
    );
  }

  if (error) {
    return (
      <Container variant="secondaryPage">
        <Header 
          title="Movimientos" 
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
          <Text className="text-red-500 text-center mb-4">{error}</Text>
          <TouchableOpacity
            onPress={handleBackPress}
            className="bg-primary-500 px-4 py-2 rounded-lg"
          >
            <Text className="text-white">Volver</Text>
          </TouchableOpacity>
        </View>
      </Container>
    );
  }

  return (
    <Container variant="secondaryPage">
      <Header 
        title="Movimientos" 
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
              No hay movimientos
            </Text>
            <Text className="text-sm text-gray-600 text-center">
              Aún no hay movimientos registrados para esta meta
            </Text>
          </View>
        )}
      </View>
    </Container>
  );
} 