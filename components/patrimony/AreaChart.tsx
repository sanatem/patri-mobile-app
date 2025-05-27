import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, PanResponder } from 'react-native';
import * as shape from 'd3-shape';
import * as scale from 'd3-scale';
import * as array from 'd3-array';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Line } from 'react-native-svg';
import Colors from '@/constants/Colors';
import { useChartRangeStore } from '@/store/chartRangeStore';
import data from '@/assets/data/patrimony-daily.json';

interface PatrimonyEntry {
  date: string;
  value: number;
}

const { width: screenWidth } = Dimensions.get('window');
const CHART_HEIGHT = 180;
const CHART_MARGIN = 24;

export default function AreaChart() {
  const { rangeSize } = useChartRangeStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const chartRef = useRef(null);

  const latestDate = new Date(data[data.length - 1].date);

  const filteredData = data.filter((entry) => {
    const entryDate = new Date(entry.date);
    switch (rangeSize) {
      case '1m': {
        const d = new Date(latestDate);
        d.setMonth(d.getMonth() - 1);
        return entryDate >= d;
      }
      case '6m': {
        const d = new Date(latestDate);
        d.setMonth(d.getMonth() - 6);
        return entryDate >= d;
      }
      case '1y': {
        const d = new Date(latestDate);
        d.setFullYear(d.getFullYear() - 1);
        return entryDate >= d;
      }
      default:
        return true;
    }
  });

  const values = filteredData.map((d) => d.value);
  const dates = filteredData.map((d) => d.date);

  const chartWidth = screenWidth - 2 * CHART_MARGIN;

  const x = scale
    .scaleLinear()
    .domain([0, filteredData.length - 1])
    .range([0, chartWidth]);

  const y = scale
    .scaleLinear()
    .domain([array.min(values) || 0, array.max(values) || 0])
    .range([CHART_HEIGHT - 20, 20]);

  const area = shape
    .area<PatrimonyEntry>()
    .x((_, i) => x(i))
    .y0(() => y(array.min(values) || 0))
    .y1((d) => y(d.value))
    .curve(shape.curveMonotoneX)(filteredData);

  const line = shape
    .line<PatrimonyEntry>()
    .x((_, i) => x(i))
    .y((d) => y(d.value))
    .curve(shape.curveMonotoneX)(filteredData);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const relativeX = gestureState.moveX - CHART_MARGIN;
        const pointWidth = chartWidth / (filteredData.length - 1);

        let index = Math.round(relativeX / pointWidth);
        index = Math.max(0, Math.min(filteredData.length - 1, index));

        setActiveIndex(index);
      },
    })
  ).current;

  const activeData = filteredData[activeIndex];
  const cx = x(activeIndex);
  const cy = y(activeData.value);

  useEffect(() => {
    setActiveIndex(0);
  }, [rangeSize]);

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <View style={[styles.tooltipCardStatic, { left: CHART_MARGIN }]} pointerEvents="none">
        <Text style={styles.tooltipDate}>
          {new Date(activeData.date).toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
        <Text style={styles.tooltipValue}>
          ${activeData.value.toLocaleString('es-CL')}
        </Text>
      </View>

      <View style={{ marginHorizontal: CHART_MARGIN }}>
        <Svg width={chartWidth} height={CHART_HEIGHT} ref={chartRef}>
          <Defs>
            <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#22C55E" stopOpacity={0.2} />
              <Stop offset="100%" stopColor="#22C55E" stopOpacity={0.05} />
            </LinearGradient>
          </Defs>
          {area && <Path d={area} fill="url(#gradient)" />}
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
        <View style={styles.labelsRow}>
          <Text style={styles.labelText}>
            {new Date(filteredData[0].date).toLocaleDateString('es-CL', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          <Text style={styles.labelText}>
            {new Date(filteredData[filteredData.length - 1].date).toLocaleDateString('es-CL', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: CHART_HEIGHT + 100,
    marginTop: 8,
  },
  tooltipCardStatic: {
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
    width: 160,
    zIndex: 10,
    alignItems: 'flex-start'
  },
  tooltipDate: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.gray[500],
  },
  tooltipValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: Colors.gray[900],
  },
  labelsRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.gray[500],
  },
});
