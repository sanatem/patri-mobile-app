import { useMemo } from 'react';
import { useChartRangeStore } from '@/store/chartRangeStore';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import data from '@/data/mock/patrimony-daily.json';
import { areaChartCardStyles } from '@/styles/patrimony/AreaChartCard.styles';

export default function AreaChart() {
  const { rangeSize } = useChartRangeStore();

  const latestDate = new Date(data[data.length - 1].date);

  const filteredData = useMemo(() => {
    return data.filter((entry) => {
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
  }, [rangeSize, latestDate]);

  const chartData = filteredData.map(entry => ({
    x: entry.date,
    y: entry.value, 
  }));

  const formatPatrimonyValue = (value: number): string => {
    return `$${value.toLocaleString('es-CL')}`;
  };

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
