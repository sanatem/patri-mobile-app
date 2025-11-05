import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { useGoalHistory } from '@/hooks/investment/useGoalHistory';
import Colors from '@/constants/Colors';
import { SkeletonBase } from '@/components/ui/SkeletonBase';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const { historyData, loading, error } = useGoalHistory({
    goalId,
    period: 'ALL',
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
          x: date.toISOString().slice(0, 10), // Format: YYYY-MM-DD
          y: amount,
          projected: true
        });
      }
    }
    
    return [...historicData, ...projectedData];
  };

  const chartData = generateChartData();
  
  if (currentAmount === null || currentAmount === undefined || !targetAmount) {
    return (
      <View style={styles.card}>
        <View style={{ marginBottom: 20 }}>
          <SkeletonBase
            width={300}
            height={180}
            x={0}
            y={0}
            rows={1}
            rowHeight={180}
            rowWidth={300}
            borderRadius={16}
          />
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.currentAmountContainer}>
            <SkeletonBase
              width={150}
              height={20}
              x={0}
              y={0}
              rows={1}
              rowHeight={20}
              rowWidth={150}
              borderRadius={4}
            />
          </View>
          <View style={styles.progressBarBackground}>
            <SkeletonBase
              width={280}
              height={8}
              x={0}
              y={0}
              rows={1}
              rowHeight={8}
              rowWidth={280}
              borderRadius={4}
            />
          </View>
          <SkeletonBase
            width={250}
            height={16}
            x={0}
            y={0}
            rows={1}
            rowHeight={16}
            rowWidth={250}
            borderRadius={4}
            style={{ marginTop: 4 }}
          />
        </View>
      </View>
    );
  }

  // Fixed date formatting function
  const formatDate = (dateString: string) => {
    try {
      // Handle the API format: "2024-09-11"
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return t('goals.date_unavailable');
      }
      
      return date.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.warn('Error formatting date:', dateString, error);
      return t('goals.date_unavailable');
    }
  };

  const formatValue = (value: number) => {
    return `$${Math.round(value).toLocaleString('es-CL')}`;
  };

  const customFormatDate = (date: string) => {
    const originalData = chartData.find(item => item.x === date);
    const formattedDate = formatDate(date);
    return originalData?.projected ? `${formattedDate} (${t('goals.projected')})` : formattedDate;
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
          ${Math.round(currentAmount).toLocaleString('es-CL')} <Text style={styles.currencyLabel}>CLP</Text>
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
        {progressPercentage.toFixed(2)}% {t('goals.of')} ${Math.round(targetAmount).toLocaleString('es-CL')} {t('goals.by')} {getCurrentDate()}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.card}>
        <View style={{ marginBottom: 20 }}>
          <SkeletonBase
            width={300}
            height={180}
            x={0}
            y={0}
            rows={1}
            rowHeight={180}
            rowWidth={300}
            borderRadius={16}
          />
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.currentAmountContainer}>
            <SkeletonBase
              width={150}
              height={20}
              x={0}
              y={0}
              rows={1}
              rowHeight={20}
              rowWidth={150}
              borderRadius={4}
            />
          </View>
          <View style={styles.progressBarBackground}>
            <SkeletonBase
              width={280}
              height={8}
              x={0}
              y={0}
              rows={1}
              rowHeight={8}
              rowWidth={280}
              borderRadius={4}
            />
          </View>
          <SkeletonBase
            width={250}
            height={16}
            x={0}
            y={0}
            rows={1}
            rowHeight={16}
            rowWidth={250}
            borderRadius={4}
            style={{ marginTop: 4 }}
          />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.card, styles.errorContainer]}>
        <Text style={styles.errorText}>{t('goals.history_error_title')}</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
      </View>
    );
  }

  return (
    <InteractiveChart
      data={chartData}
      title={t('goals.goal_progress_title')}
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