import React, { useState, useEffect } from 'react';
import { SkeletonBase } from '@/components/ui/SkeletonBase';
import { View, ActivityIndicator, Text } from 'react-native';
import { useChartRangeStore } from '@/store/chartRangeStore';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { useNetworthHistoric } from '@/hooks/patrimony/useNetworthHistoric';
import { areaChartCardStyles } from '@/styles/patrimony/AreaChartCard.styles';
import Colors from '@/constants/Colors';
import data from '@/data/mock/patrimony-daily.json';
import { CHART_CONFIG, CHART_STYLES } from '@/constants/ChartConfig';
import { useChartDimensions } from '@/hooks/chart/useChartDimensions';

export default function AreaChart() {
  const { rangeSize } = useChartRangeStore();
  const { chartWidth } = useChartDimensions(CHART_CONFIG.margin);

  const { 
    historicData, 
    loading, 
    error,
    loadMore,
    hasMore 
  } = useNetworthHistoric();
    
  useEffect(() => {
    if (hasMore) {
      loadMore();
    }
  }, [hasMore, loadMore]);

  const filteredChartData = (() => {
    if (!historicData?.historic.timeline || historicData.historic.timeline.length === 0) {
      return [];
    }

    if (rangeSize === 'all') {
      const allData = historicData.historic.timeline
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return allData.map(entry => ({
        x: entry.date,
        y: entry.value
      }));
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let startDate = new Date(today);
    
    switch (rangeSize) {
      case '1m':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case '6m':
        startDate.setMonth(today.getMonth() - 6);
        break;
      case '1y':
      default:
        startDate.setFullYear(today.getFullYear() - 1);
        break;
    }

    const filteredData = historicData.historic.timeline
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= today;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return filteredData.map(entry => ({
      x: entry.date,
      y: entry.value
    }));
  })();

  const formatPatrimonyValue = (value: number): string => {
    return `${value.toLocaleString('es-CL')}`;
  };

  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowChart(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!showChart) {
    return (
      <View style={[CHART_STYLES.defaultCardStyle, areaChartCardStyles.card]}>
        <SkeletonBase
          rows={1}
          rowHeight={CHART_CONFIG.height}
          rowWidth={chartWidth}
          height={CHART_CONFIG.height + 20}
          width={chartWidth + (2 * CHART_CONFIG.margin)}
          x={CHART_CONFIG.margin}
          y={20}
          borderRadius={16}
        />
      </View>
    );
  }

  if (error || !historicData || historicData.historic.timeline.length === 0) {
    if (rangeSize === 'all') {
      const allMockData = data
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return (
        <InteractiveChart
          data={allMockData.map(entry => ({
            x: entry.date,
            y: entry.value
          }))}
          title=""
          formatValue={formatPatrimonyValue}
          gradientId="patrimonyGradient"
          showDynamicColors={true}
          showDateLabels={true}
          cardStyle={areaChartCardStyles.card}
        />
      );
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let startDate = new Date(today);
    
    switch (rangeSize) {
      case '1m':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case '6m':
        startDate.setMonth(today.getMonth() - 6);
        break;
      case '1y':
      default:
        startDate.setFullYear(today.getFullYear() - 1);
        break;
    }

    const filteredMockData = data
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= today;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
      <InteractiveChart
        data={filteredMockData.map(entry => ({
          x: entry.date,
          y: entry.value
        }))}
        title=""
        formatValue={formatPatrimonyValue}
        gradientId="patrimonyGradient"
        showDynamicColors={true}
        showDateLabels={true}
        cardStyle={areaChartCardStyles.card}
      />
    );
  }

  return (
    <InteractiveChart
      data={filteredChartData}
      title=""
      formatValue={formatPatrimonyValue}
      gradientId="patrimonyGradient"
      showDynamicColors={true}
      showDateLabels={true}
      cardStyle={areaChartCardStyles.card}
    />
  );
}