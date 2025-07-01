import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Dimensions, PanResponder, StyleSheet } from 'react-native';
import * as shape from 'd3-shape';
import * as scale from 'd3-scale';
import * as array from 'd3-array';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Line } from 'react-native-svg';
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

const { width: screenWidth } = Dimensions.get('window');
const CHART_HEIGHT = 180;
const CHART_MARGIN = 16;

export function GoalProgressChart({ 
  currentAmount, 
  targetAmount, 
  projectedData,
  targetDate 
}: GoalProgressChartProps) {
  
  const [activeIndex, setActiveIndex] = useState(projectedData.length - 1);
  const chartRef = useRef(null);
  
  const progressPercentage = (currentAmount / targetAmount) * 100;
  
  const values = projectedData.map((d) => d.amount);
  const chartWidth = screenWidth - (2 * 16) - (2 * 28); 

  const x = scale
    .scaleLinear()
    .domain([0, projectedData.length - 1])
    .range([0, chartWidth]);

  const y = scale
    .scaleLinear()
    .domain([array.min(values) || 0, array.max(values) || 0])
    .range([CHART_HEIGHT - 20, 20]);

  const area = shape
    .area<GoalProgressData>()
    .x((_, i) => x(i))
    .y0(() => y(array.min(values) || 0))
    .y1((d) => y(d.amount))
    .curve(shape.curveMonotoneX)(projectedData);

  const line = shape
    .line<GoalProgressData>()
    .x((_, i) => x(i))
    .y((d) => y(d.amount))
    .curve(shape.curveMonotoneX)(projectedData);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const relativeX = gestureState.moveX - CHART_MARGIN;
        const pointWidth = chartWidth / (projectedData.length - 1);

        let index = Math.round(relativeX / pointWidth);
        index = Math.max(0, Math.min(projectedData.length - 1, index));

        setActiveIndex(index);
      },
    })
  ).current;

  const activeData = projectedData[activeIndex];
  const cx = x(activeIndex);
  const cy = y(activeData.amount);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + '-01'); 
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Evolución de la meta
        </Text>
      </View>
      <View style={styles.chartContainer} {...panResponder.panHandlers}>
        <View style={[styles.tooltip, { left: CHART_MARGIN }]}>
          <Text style={styles.tooltipDate}>
            {formatDate(activeData.date)}
          </Text>
          <Text style={styles.tooltipValue}>
            ${activeData.amount.toLocaleString('es-CL')}
          </Text>
          {activeData.projected && (
            <Text style={styles.projectedLabel}>Proyectado</Text>
          )}
        </View>

        <View style={{ marginHorizontal: CHART_MARGIN }}>
          <Svg width={chartWidth} height={CHART_HEIGHT} ref={chartRef}>
            <Defs>
              <LinearGradient id="goalProgressGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#22C55E" stopOpacity={0.2} />
                <Stop offset="100%" stopColor="#22C55E" stopOpacity={0.05} />
              </LinearGradient>
            </Defs>
            {area && <Path d={area} fill="url(#goalProgressGradient)" />}
            {line && <Path d={line} fill="none" stroke="#22C55E" strokeWidth={2.5} />}

            <Line
              x1={cx}
              x2={cx}
              y1={0}
              y2={CHART_HEIGHT}
              stroke={Colors.gray[200]}
              strokeDasharray="4,4"
            />

            <Circle cx={cx} cy={cy} r={14} fill="rgba(34,197,94,0.2)" />
            <Circle cx={cx} cy={cy} r={7} fill="#22C55E" />
          </Svg>
        </View>
      </View>

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
    </View>
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
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.gray[700],
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: Colors.gray[500],
  },
  amountsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: Colors.gray[500],
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.gray[800],
  },
  amountRight: {
    alignItems: 'flex-end',
  },
  chartContainer: {
    height: CHART_HEIGHT + 20,
    marginBottom: 24,
  },
  tooltip: {
    position: 'absolute',
    top: 0,
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    minWidth: 120,
    zIndex: 10,
    alignItems: 'flex-start'
  },
  tooltipDate: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: Colors.gray[500],
  },
  tooltipValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: Colors.gray[900],
  },
  projectedLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    color: '#22C55E',
    marginTop: 2,
  },
  progressContainer: {
    marginTop: 8,
    paddingHorizontal: 16,
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