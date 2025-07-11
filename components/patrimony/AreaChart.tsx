import { useMemo, useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useChartRangeStore } from '@/store/chartRangeStore';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { useNetworthHistoric } from '@/hooks/patrimony/useNetworthHistoric';
import { areaChartCardStyles } from '@/styles/patrimony/AreaChartCard.styles';
import Colors from '@/constants/Colors';
import data from '@/data/mock/patrimony-daily.json';

export default function AreaChart() {
  const { rangeSize } = useChartRangeStore();

  // Fetch all data without date filters
  const { 
    historicData, 
    loading, 
    error,
    loadMore,
    hasMore 
  } = useNetworthHistoric();

  // Load more data if available
  useEffect(() => {
    if (hasMore) {
      console.log('📊 AreaChart - Loading more data');
      loadMore();
    }
  }, [hasMore, loadMore]);

  // Filter data based on selected range
  const filteredChartData = useMemo(() => {
    if (!historicData?.historic.timeline || historicData.historic.timeline.length === 0) {
      return [];
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
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        // For 'all', use earliest date in data
        startDate = new Date('2020-01-01');
    }

    console.log('📊 AreaChart - Filtering data:', {
      range: rangeSize,
      startDate: startDate.toISOString(),
      totalDataPoints: historicData.historic.timeline.length
    });

    const filteredData = historicData.historic.timeline
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= today;
      })
      // Ordenar por fecha ascendente (más antiguo a más reciente)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    console.log('📊 AreaChart - Filtered results:', {
      totalFiltered: filteredData.length,
      firstDate: filteredData[0]?.date,
      lastDate: filteredData[filteredData.length - 1]?.date,
      order: 'oldest to newest (left to right)'
    });

    return filteredData.map(entry => ({
      x: entry.date,
      y: entry.value
    }));
  }, [historicData, rangeSize]);

  const formatPatrimonyValue = (value: number): string => {
    return `${value.toLocaleString('es-CL')}`;
  };

  // Loading state
  if (loading && (!historicData || historicData.historic.timeline.length === 0)) {
    return (
      <View style={[areaChartCardStyles.card, { 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: 200
      }]}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <Text style={{
          marginTop: 10,
          fontSize: 14,
          color: Colors.gray[600]
        }}>
          Cargando gráfico...
        </Text>
      </View>
    );
  }

  // Error state or no data - use mock data as fallback
  if (error || !historicData || historicData.historic.timeline.length === 0) {
    console.log('📊 AreaChart - Using mock data:', { 
      error, 
      hasData: !!historicData,
      dataLength: historicData?.historic.timeline.length || 0 
    });
    
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
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        startDate = new Date('2020-01-01');
    }

    const filteredMockData = data
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= today;
      })
      // Ordenar por fecha ascendente (más antiguo a más reciente)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    console.log('📊 AreaChart - Mock data filtered:', {
      total: filteredMockData.length,
      firstDate: filteredMockData[0]?.date,
      lastDate: filteredMockData[filteredMockData.length - 1]?.date,
      order: 'oldest to newest (left to right)'
    });

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

  // Render chart with filtered data
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