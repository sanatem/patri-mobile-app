import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { TooltipData } from '@/types/chart';
import Colors from '@/constants/Colors';

interface GoalProgressData {
  date: string;
  amount: number;
  projected?: boolean;
}

interface GoalProgressChartProps {
  currentAmount: number;
  targetAmount: number;
  projectedData: GoalProgressData[];
  targetDate: string;
}

export function GoalProgressChart({ 
  currentAmount, 
  targetAmount, 
  projectedData,
  targetDate 
}: GoalProgressChartProps) {
  
  const progressPercentage = (currentAmount / targetAmount) * 100;
  
  const chartData = projectedData.map((item) => ({
    x: item.date,
    y: item.amount,
    projected: item.projected
  }));

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

  // Custom formatters that include projected info
  const customFormatDate = (date: string) => {
    const originalData = projectedData.find(item => item.date === date);
    const formattedDate = formatDate(date);
    return originalData?.projected ? `${formattedDate} (Proyectado)` : formattedDate;
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
        {progressPercentage.toFixed(2)}% de ${targetAmount.toLocaleString('es-CL')} al {targetDate}
      </Text>
    </View>
  );

  return (
    <InteractiveChart
      data={chartData}
      title="Evolución de la meta"
      height={180}
      formatValue={formatValue}
      formatDate={customFormatDate}
      lineColor="#22C55E"
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
    marginTop: 8,
  },
  currentAmountContainer: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  currentAmountValue: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#22C55E',
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
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: '#22C55E',
  },
  progressDetailsText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: Colors.gray[600],
    textAlign: 'left',
  },
}); 