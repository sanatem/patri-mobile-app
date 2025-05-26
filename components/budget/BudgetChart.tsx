import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import Colors from '@/constants/Colors';

// Datos de presupuesto (en una app real vendrían del estado/API)
const budgetData = [
  { label: 'Vivienda', value: 640000, color: Colors.secondary[500], percentage: 41.9 },
  { label: 'Transporte', value: 280000, color: '#3B82F6', percentage: 18.4 },
  { label: 'Ocio', value: 157682, color: '#EC4899', percentage: 10.3 },
  { label: 'Salud', value: 120000, color: '#06B6D4', percentage: 7.9 },
  { label: 'Servicios', value: 330315, color: '#10B981', percentage: 21.5 },
];

const totalBudget = 1525997;
const remaining = 568315;

const BudgetChart: React.FC = () => {
  const { width: screenWidth } = Dimensions.get('window');
  const chartSize = Math.min(screenWidth - 80, 280);
  const center = chartSize / 2;
  const radius = (chartSize / 2) - 30;
  const innerRadius = radius - 25;

  // Crear arcos usando Circle con strokeDasharray (más simple y preciso)
  const createArcs = () => {
    const circumference = 2 * Math.PI * radius;
    let cumulativeAngle = 0;
    
    return budgetData.map(item => {
      const percentage = item.value / totalBudget;
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
            restante de ${totalBudget.toLocaleString('es-CL')}
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
    fontFamily: 'Inter-Bold',
    fontSize: 26,
    color: Colors.gray[900],
    textAlign: 'center',
    marginBottom: 4,
  },
  centerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.gray[500],
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default BudgetChart;