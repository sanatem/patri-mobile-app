import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { useGoalHistory } from '@/hooks/investment/useGoalHistory';
import Colors from '@/constants/Colors';

interface GoalProgressChartProps {
  goalId: string;
  currentAmount: number;
  targetAmount: number;
  targetDate: string;
  startDate?: string;
  endDate?: string;
}

export function GoalProgressChart({ 
  goalId,
  currentAmount, 
  targetAmount, 
  targetDate,
  startDate,
  endDate
}: GoalProgressChartProps) {
  
  const { historyData, loading, error } = useGoalHistory({
    goalId,
    startDate,
    endDate,
    perPage: 100
  });
  
  const progressPercentage = (currentAmount / targetAmount) * 100;
  
  const generateChartData = () => {
    if (!historyData?.historicValues || historyData.historicValues.length === 0) {
      return [];
    }
    
    const historicData = historyData.historicValues.map(point => ({
      x: point.date,
      y: point.value,
      projected: false
    }));
    
    const projectedData = [];
    const today = new Date();
    const goalDate = new Date(targetDate.split('/').reverse().join('-'));
    const monthsDiff = Math.ceil((goalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    if (monthsDiff > 0) {
      const monthlyIncrement = (targetAmount - currentAmount) / monthsDiff;
      
      for (let i = 1; i <= Math.min(monthsDiff, 6); i++) {
        const date = new Date(today);
        date.setMonth(date.getMonth() + i);
        const amount = Math.min(currentAmount + (monthlyIncrement * i), targetAmount);
        projectedData.push({
          x: date.toISOString().slice(0, 7),
          y: amount,
          projected: true
        });
      }
    }
    
    return [...historicData, ...projectedData];
  };

  const chartData = generateChartData();
  if (!currentAmount || !targetAmount) {
    return (
      <View style={[styles.card, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <Text style={styles.loadingText}>Preparando gráfico...</Text>
      </View>
    );
  }


  const formatDate = (dateString: string) => {
    const date = new Date(dateString + '-01'); 
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long'
    });
  };

  const formatValue = (value: number) => {
    return `$${value.toLocaleString('es-CL')}`;
  };

  const customFormatDate = (date: string) => {
    const originalData = chartData.find(item => item.x === date);
    const formattedDate = formatDate(date);
    return originalData?.projected ? `${formattedDate} (Proyectado)` : formattedDate;
  };

  const getCurrentDate = () => {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const bottomContent = (
    <View style={styles.progressContainer}>
      <View style={styles.currentAmountContainer}>
        <Text style={styles.currentAmountValue}>
          ${currentAmount.toLocaleString('es-CL')} <Text style={styles.currencyLabel}>CLP</Text>
        </Text>
      </View>
      
      <View style={styles.progressBarBackground}>
        <View 
          style={[
            styles.progressBarFill,
            { 
              width: `${Math.min(progressPercentage, 100)}%`
            }
          ]}
        />
      </View>
      
      <Text style={styles.progressDetailsText}>
        {progressPercentage.toFixed(2)}% de ${targetAmount.toLocaleString('es-CL')} al {getCurrentDate()}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.card, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <Text style={styles.loadingText}>Cargando historial...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.card, styles.errorContainer]}>
        <Text style={styles.errorText}>Error al cargar el historial</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
      </View>
    );
  }

  return (
    <InteractiveChart
      data={chartData}
      title="Evolución de la meta"
      height={180}
      formatValue={formatValue}
      formatDate={customFormatDate}
      gradientId="goalProgressGradient"
      showDynamicColors={true}
      cardStyle={styles.card}
      bottomContent={bottomContent}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 28,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 10,
    marginHorizontal: 2,
    marginTop: 0,
    marginBottom: 32,
  },
  progressContainer: {
    marginTop: 0,
  },
  currentAmountContainer: {
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  currentAmountValue: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.success[500],
  },
  currencyLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: Colors.gray[500],
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: Colors.gray[100],
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: Colors.success[500],
  },
  progressDetailsText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: Colors.gray[600],
    textAlign: 'left',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: Colors.gray[600],
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.error[500],
    textAlign: 'center',
  },
  errorSubtext: {
    marginTop: 5,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: Colors.gray[600],
    textAlign: 'center',
  },
}); 