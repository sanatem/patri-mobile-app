import { useMemo } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useChartRangeStore } from '@/store/chartRangeStore';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { useNetworthHistoric } from '@/hooks/patrimony/useNetworthHistoric';
import { areaChartCardStyles } from '@/styles/patrimony/AreaChartCard.styles';
import Colors from '@/constants/Colors';
import data from '@/data/mock/patrimony-daily.json';

export default function AreaChart() {
  const { rangeSize } = useChartRangeStore();

  // Primero obtener todos los datos para conocer la fecha más reciente
  const { historicData: allData, loading: allDataLoading } = useNetworthHistoric();

  // Calcular fechas basadas en el rango seleccionado y la fecha más reciente real
  const dateRange = useMemo(() => {
    // Si estamos cargando o no hay datos, no calcular fechas aún
    if (allDataLoading || !allData || allData.historic.timeline.length === 0) {
      return {};
    }

    // Obtener la fecha más reciente de los datos reales
    const latestDataDate = new Date(allData.historic.timeline[allData.historic.timeline.length - 1].date);
    
    console.log('📊 Latest data date:', latestDataDate.toISOString().split('T')[0]);
    console.log('📊 Selected range:', rangeSize);

    let startDate: Date;

    switch (rangeSize) {
      case '1m': {
        startDate = new Date(latestDataDate);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      }
      case '6m': {
        startDate = new Date(latestDataDate);
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      }
      case '1y': {
        startDate = new Date(latestDataDate);
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      }
      default: {
        // Para 'all' o cualquier otro valor, no enviar fechas para obtener todo el historial
        console.log('📊 Requesting all historical data');
        return {};
      }
    }

    const calculatedRange = {
      start_date: startDate.toISOString().split('T')[0], // Formato YYYY-MM-DD
      end_date: latestDataDate.toISOString().split('T')[0]
    };

    console.log('📊 Calculated date range:', calculatedRange);
    return calculatedRange;
  }, [rangeSize, allData, allDataLoading]);

  // Usar el hook con el rango de fechas calculado (solo si no estamos en modo 'all')
  const { historicData: filteredData, loading: filteredLoading, error } = useNetworthHistoric(
    Object.keys(dateRange).length > 0 ? dateRange : {}
  );

  // Determinar qué datos usar
  const dataToUse = Object.keys(dateRange).length > 0 ? filteredData : allData;
  const isLoading = Object.keys(dateRange).length > 0 ? filteredLoading : allDataLoading;

  const formatPatrimonyValue = (value: number): string => {
    return `${value.toLocaleString('es-CL')}`;
  };

  // Estado de carga
  if (isLoading) {
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

  // Estado de error o sin datos - usar datos mock como fallback
  if (error || !dataToUse) {
    console.log('📊 Using mock data as fallback:', { error, hasData: !!dataToUse });
    
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

    const chartData = filteredData.map(entry => ({
      x: entry.date,
      y: entry.value, 
    }));

    return (
      <InteractiveChart
        data={chartData}
        title=""
        formatValue={formatPatrimonyValue}
        gradientId="patrimonyGradient"
        showDynamicColors={true}
        showDateLabels={true}
        cardStyle={areaChartCardStyles.card}
      />
    );
  }

  // Usar datos reales del API
  const chartData = dataToUse.historic.timeline.map(entry => ({
    x: entry.date,
    y: entry.value,
  }));

  console.log('📊 Chart data points:', chartData.length);
  console.log('📊 Date range in chart:', {
    from: chartData[0]?.x,
    to: chartData[chartData.length - 1]?.x
  });

  return (
    <InteractiveChart
      data={chartData}
      title=""
      formatValue={formatPatrimonyValue}
      gradientId="patrimonyGradient"
      showDynamicColors={true}
      showDateLabels={true}
      cardStyle={areaChartCardStyles.card}
    />
  );
}