import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { ChevronLeft, ArrowUp } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Header } from '@/components/ui/Header';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { getMovementsByGoal, Movement } from '@/services/investment/portfolio/movements/get-movements';
import Colors from '@/constants/Colors';

export default function MovementsScreen() {
  const router = useRouter();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  const metaName = 'Emergencias'; // This should come from params in real implementation

  useEffect(() => {
    const loadMovements = async () => {
      try {
        setLoading(true);
        const movementsData = await getMovementsByGoal(metaName);
        setMovements(movementsData);
      } catch (error) {
        console.error('Error loading movements:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMovements();
  }, [metaName]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };





  const renderMovementItem = ({ item }: { item: Movement }) => (
    <Card className="mb-2">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <ArrowUp size={20} color={Colors.success[500]} />
          <Text className="text-base font-medium text-gray-900 ml-3">
            {item.title}
          </Text>
        </View>
        <Text className="text-lg font-medium text-gray-900 ml-3">
          {formatCurrency(item.value)}
        </Text>
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
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full justify-center items-center"
            >
              <ChevronLeft size={24} color={Colors.primary[700]} />
            </TouchableOpacity>
          }
        />
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-600">Cargando movimientos...</Text>
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
            onPress={() => router.back()}
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