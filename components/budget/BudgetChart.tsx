import React from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Colors from '@/constants/Colors';
import { budgetService } from '@/services/budget/get-budget';
import { SkeletonBase } from '@/components/ui/SkeletonBase';
import { useTranslation } from 'react-i18next';

interface BudgetChartProps {
  selectedMonth: string;
  totalIncome?: number;
  totalExpenses?: number;
  balance?: number;
  remainingBudget?: number;
  isLoading?: boolean;
  hasRealData?: boolean;
}

const BudgetChart: React.FC<BudgetChartProps> = ({ 
  selectedMonth,
  totalIncome = 0,
  totalExpenses = 0,
  balance = 0,
  remainingBudget = 0,
  isLoading = false,
  hasRealData = false
}) => {
  const { t } = useTranslation();
  const { width: screenWidth } = Dimensions.get('window');
  const chartSize = Math.min(screenWidth - 80, 280);
  const center = chartSize / 2;
  const radius = (chartSize / 2) - 30;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (!isLoading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [isLoading]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('es-CL');
  };

  const getBalanceText = () => {
    if (balance >= 0) {
      return `$${formatCurrency(balance)}`;
    } else {
      return `-$${formatCurrency(Math.abs(balance))}`;
    }
  };

  // ✅ FUNCIÓN PARA OBTENER COLOR DINÁMICO DEL GRÁFICO
  const getGraphColor = () => {
    if (balance >= 0) {
      return Colors.success[500]; // ✅ Verde para balance positivo
    } else {
      return Colors.secondary[500]; // ✅ Secondary (naranja/azul) para balance negativo
    }
  };

  // ✅ ESTADO DE CARGA
  if (isLoading) {
    return (
      <View style={[styles.container, { minHeight: chartSize }]}>
        <View style={[styles.chartContainer, { width: chartSize, height: chartSize }]}>
          <SkeletonBase
            width={chartSize}
            height={chartSize}
            x={0}
            y={0}
            rows={1}
            rowHeight={chartSize}
            rowWidth={chartSize}
            borderRadius={chartSize / 2}
            style={{ borderRadius: chartSize / 2 }}
          />
          <View style={styles.centerContent}>
            <SkeletonBase
              width={140}
              height={60}
              x={0}
              y={0}
              rows={2}
              rowHeight={26}
              rowWidth={140}
              rowSpacing={4}
              borderRadius={4}
            />
          </View>
        </View>
      </View>
    );
  }

  // ✅ ESTADO SIN DATOS
  if (!hasRealData || (totalIncome === 0 && totalExpenses === 0)) {
    return (
      <Animated.View style={[styles.container, { minHeight: chartSize, opacity: fadeAnim }]}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyChart}>
            <Svg width={chartSize} height={chartSize}>
              <Circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={Colors.gray[100]}
                strokeWidth={25}
              />
            </Svg>
            <View style={styles.centerContent}>
            <Text style={styles.emptyTitle}>{t('budget_chart.no_data_title')}</Text>
            <Text style={styles.emptySubtitle}>
              {t('budget_chart.no_data_subtitle', { month: selectedMonth })}
            </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  }

  // ✅ ESTADO CON DATOS REALES - Color dinámico del gráfico
  const chartData = {
    budgetData: [
      {
        label: t('budget_chart.total_expenses'),
        value: totalExpenses,
        color: getGraphColor(), // ✅ Color dinámico según el balance
        percentage: remainingBudget > 0 ? (totalExpenses / remainingBudget) * 100 : 0
      }
    ],
    totalBudget: remainingBudget,
    totalExpenses: totalExpenses,
    remaining: balance
  };

  const { budgetData, totalBudget, remaining } = chartData;

  const createArcs = () => {
    if (totalBudget === 0) return [];
    
    const circumference = 2 * Math.PI * radius;
    let cumulativeAngle = 0;
    
    return budgetData.map(item => {
      const percentage = totalBudget > 0 ? item.value / totalBudget : 0;
      const strokeLength = circumference * percentage;
      const gapLength = circumference - strokeLength;
      const strokeDasharray = `${strokeLength} ${gapLength}`;
      const rotation = cumulativeAngle;
      
      cumulativeAngle += percentage * 360;
      
      return {
        ...item,
        strokeDasharray,
        rotation,
        circumference
      };
    });
  };

  const arcs = createArcs();

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={[styles.chartContainer, { width: chartSize, height: chartSize }]}>
        <Svg width={chartSize} height={chartSize}>
          {/* Círculo base */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={Colors.gray[100]}
            strokeWidth={25}
          />
          
          {/* ✅ Arcos con color dinámico */}
          {arcs.map((arc, index) => (
            <Circle
              key={index}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={arc.color} // ✅ Color dinámico aplicado aquí
              strokeWidth={25}
              strokeDasharray={arc.strokeDasharray}
              strokeDashoffset={-(arc.circumference * 0.25)}
              transform={`rotate(${arc.rotation} ${center} ${center})`}
              strokeLinecap="round"
            />
          ))}
        </Svg>
      
        <View style={styles.centerContent}>
          <Text style={[styles.centerAmount, { color: Colors.primary[500] }]}>
            {getBalanceText()}
          </Text>
          <Text style={styles.centerSubtitle}>
            {totalBudget > 0 
              ? t('budget_chart.remaining_of', { amount: formatCurrency(totalBudget) })
              : t('budget_chart.no_data_this_month')
            }
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  chartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '60%',
    height: '60%',
  },
  centerAmount: {
    fontFamily: 'Poppins-Bold',
    fontSize: 26,
    textAlign: 'center',
    marginBottom: 4,
  },
  centerSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: Colors.gray[500],
    textAlign: 'center',
    lineHeight: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyChart: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: Colors.gray[600],
    textAlign: 'center',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.gray[500],
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default BudgetChart;