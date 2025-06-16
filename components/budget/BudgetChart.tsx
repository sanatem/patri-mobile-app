import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Colors from '@/constants/Colors';
import { budgetService } from '@/services/budget/get-budget';

interface BudgetChartProps {
  selectedMonth: string;
}

const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Función para convertir nombre de mes a número
const getMonthNumber = (monthName: string): number => {
  return months.indexOf(monthName) + 1;
};

// Función para calcular gastos por categoría usando solo datos del presupuesto
const calculateBudgetDataByMonth = (selectedMonth: string) => {
  // Obtener datos del presupuesto del servicio
  const budget = budgetService.getBudget();
  const categories = budgetService.getCategories();
  const monthlyIncome = budgetService.getMonthlyIncome();
  const monthlyExpenses = budgetService.getMonthlyExpenses();
  const categoryTotals = budgetService.getCategoryTotals();
  
  // Mapear categorías del servicio a las categorías del gráfico
  const budgetData = categories.map(category => {
    const amount = categoryTotals[category.label.toLowerCase()] || 0;
    return {
      label: category.label,
      value: Math.round(amount),
      color: category.color,
      percentage: monthlyExpenses > 0 ? (amount / monthlyExpenses) * 100 : 0
    };
  });
  
  const remaining = Math.round(monthlyIncome - monthlyExpenses);
  
  return {
    budgetData,
    totalBudget: Math.round(monthlyIncome),
    totalExpenses: Math.round(monthlyExpenses),
    remaining: remaining > 0 ? remaining : 0
  };
};

const BudgetChart: React.FC<BudgetChartProps> = ({ selectedMonth }) => {
  const { budgetData, totalBudget, totalExpenses, remaining } = calculateBudgetDataByMonth(selectedMonth);
  
  const { width: screenWidth } = Dimensions.get('window');
  const chartSize = Math.min(screenWidth - 80, 280);
  const center = chartSize / 2;
  const radius = (chartSize / 2) - 30;

  // Crear arcos usando Circle con strokeDasharray
  const createArcs = () => {
    if (totalExpenses === 0) return [];
    
    const circumference = 2 * Math.PI * radius;
    let cumulativeAngle = 0;
    
    return budgetData.map(item => {
      const percentage = item.value / totalExpenses;
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
    <View style={styles.container}>
      <View style={[styles.chartContainer, { width: chartSize, height: chartSize }]}>
        <Svg width={chartSize} height={chartSize}>
          {/* Fondo del donut */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={Colors.gray[100]}
            strokeWidth={25}
          />
          
          {/* Segmentos del donut */}
          {arcs.map((arc, index) => (
            <Circle
              key={index}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={arc.color}
              strokeWidth={25}
              strokeDasharray={arc.strokeDasharray}
              strokeDashoffset={-(arc.circumference * 0.25)} // Empezar desde arriba
              transform={`rotate(${arc.rotation} ${center} ${center})`}
              strokeLinecap="round"
            />
          ))}
        </Svg>
        
        {/* Contenido central */}
        <View style={styles.centerContent}>
          <Text style={styles.centerAmount}>
            ${remaining.toLocaleString('es-CL')}
          </Text>
          <Text style={styles.centerSubtitle}>
            {totalBudget > 0 ? `restante de $${totalBudget.toLocaleString('es-CL')}` : 'Sin datos para este mes'}
          </Text>
        </View>
      </View>
    </View>
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
    color: Colors.gray[900],
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
});

export default BudgetChart;