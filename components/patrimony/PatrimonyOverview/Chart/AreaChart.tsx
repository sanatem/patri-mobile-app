import React, { useState, useEffect, useMemo } from 'react';
import { SkeletonBase } from '@/components/ui/SkeletonBase';
import { View, Text } from 'react-native';
import { useChartRangeStore } from '@/store/chartRangeStore';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { useNetworthHistoric } from '@/hooks/patrimony/useNetworthHistoric';
import { areaChartCardStyles } from '@/styles/patrimony/AreaChartCard.styles';
import Colors from '@/constants/Colors';
import data from '@/data/mock/patrimony-daily.json';
import { CHART_CONFIG, CHART_STYLES } from '@/constants/ChartConfig';
import { useChartDimensions } from '@/hooks/chart/useChartDimensions';
import { useTranslation } from 'react-i18next';

export default function AreaChart() {
  const { rangeSize } = useChartRangeStore();
  const { chartWidth } = useChartDimensions(CHART_CONFIG.margin);
  const { t } = useTranslation();

  const {
    historicData,
    loading,
    error
  } = useNetworthHistoric();


  const filteredChartData = useMemo(() => {
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
  }, [historicData, rangeSize]);

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

  if (filteredChartData.length === 0) {
    return (
      <View style={[CHART_STYLES.defaultCardStyle, areaChartCardStyles.card]}>
        <Text style={{ textAlign: 'center', padding: 20, color: Colors.gray[500] }}>
          {t('patrimony.chart.noData')}
        </Text>
      </View>
    );
  }

  if (filteredChartData.length < 2) {
    return (
      <View style={[CHART_STYLES.defaultCardStyle, areaChartCardStyles.card]}>
        <Text style={{ textAlign: 'center', padding: 20, color: Colors.gray[500], fontSize: 14 }}>
          {t('patrimony.chart.buildingHistory')}{'\n\n'}
          <Text style={{ fontSize: 12, color: Colors.gray[400] }}>
            {t('patrimony.chart.buildingHistorySubtitle')}
          </Text>
        </Text>
      </View>
    );
  }


  const chart = (
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

  return chart;
}
