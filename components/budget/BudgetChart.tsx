import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Colors from '@/constants/Colors';
import transactionsData from '@/transacciones_simplificadas.json';

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

// Función para calcular gastos por categoría usando datos reales filtrados por mes
const calculateBudgetDataByMonth = (selectedMonth: string) => {
  const data = transactionsData[0];
  const transactions = data.transactions.accounts[0].transactions;
  const monthNumber = getMonthNumber(selectedMonth);
  
  let totalIncome = 0;
  let totalExpenses = 0;
  
  // Categorías de gastos
  const categories = {
    vivienda: 0,
    transporte: 0,
    ocio: 0,
    salud: 0,
    servicios: 0,
  };
  
  transactions.forEach((transaction: any) => {
    const transactionDate = new Date(transaction.date);
    const transactionMonth = transactionDate.getMonth() + 1; // getMonth() es 0-based
    
    // Solo procesar transacciones del mes seleccionado
    if (transactionMonth === monthNumber) {
      if (transaction.in > 0) {
        totalIncome += transaction.in;
      }
      
      if (transaction.out > 0) {
        totalExpenses += transaction.out;
        const description = transaction.description.toLowerCase();
        
        // Categorizar gastos usando los nombres de empresas del JSON
        if (description.includes('metrogas') || description.includes('aguas andinas') || 
            description.includes('enel') || description.includes('movistar') || 
            description.includes('entel') || description.includes('claro') || 
            description.includes('wom') || description.includes('vtr') || 
            description.includes('gtd') || description.includes('comisión') || 
            description.includes('banco')) {
          categories.servicios += transaction.out;
        } else if (description.includes('envío a ') || description.includes('transferencia a ')) {
          categories.transporte += transaction.out;
        } else if (description.includes('amazon') || description.includes('mercadolibre') || 
                   description.includes('falabella') || description.includes('sony') ||
                   description.includes('ripley') || description.includes('linio')) {
          categories.ocio += transaction.out;
        } else {
          // Para otros gastos, categorizar por monto
          if (transaction.out > 100000) {
            categories.vivienda += transaction.out * 0.6;
            categories.servicios += transaction.out * 0.4;
          } else if (transaction.out > 50000) {
            categories.ocio += transaction.out;
          } else {
            categories.ocio += transaction.out * 0.7;
            categories.servicios += transaction.out * 0.3;
          }
        }
      }
    }
  });
  
  // Si no hay datos suficientes, usar valores por defecto más realistas
  if (categories.vivienda === 0 && totalExpenses > 0) {
    categories.vivienda = totalExpenses * 0.35; // 35% para vivienda es típico
  }
  
  const budgetData = [
    { 
      label: 'Vivienda', 
      value: Math.round(categories.vivienda), 
      color: Colors.secondary[500], 
      percentage: totalExpenses > 0 ? (categories.vivienda / totalExpenses) * 100 : 0
    },
    { 
      label: 'Transporte', 
      value: Math.round(categories.transporte), 
      color: '#3B82F6', 
      percentage: totalExpenses > 0 ? (categories.transporte / totalExpenses) * 100 : 0
    },
    { 
      label: 'Ocio', 
      value: Math.round(categories.ocio), 
      color: '#EC4899', 
      percentage: totalExpenses > 0 ? (categories.ocio / totalExpenses) * 100 : 0
    },
    { 
      label: 'Salud', 
      value: Math.round(categories.salud), 
      color: '#06B6D4', 
      percentage: totalExpenses > 0 ? (categories.salud / totalExpenses) * 100 : 0
    },
    { 
      label: 'Servicios', 
      value: Math.round(categories.servicios), 
      color: '#10B981', 
      percentage: totalExpenses > 0 ? (categories.servicios / totalExpenses) * 100 : 0
    },
  ];
  
  const remaining = Math.round(totalIncome - totalExpenses);
  
  return {
    budgetData,
    totalBudget: Math.round(totalIncome),
    totalExpenses: Math.round(totalExpenses),
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