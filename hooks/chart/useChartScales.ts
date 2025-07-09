import { useMemo } from 'react';
import * as scale from 'd3-scale';
import * as array from 'd3-array';

interface ChartDataPoint {
  x: string;
  y: number; 
}

export function useChartScales(
  data: ChartDataPoint[], 
  chartWidth: number, 
  height: number
) {
  const values = useMemo(() => data.map((d) => d.y), [data]);

  const x = useMemo(() => scale
    .scaleLinear()
    .domain([0, Math.max(data.length - 1, 0)])
    .range([0, chartWidth]), [data.length, chartWidth]);

  const y = useMemo(() => scale
    .scaleLinear()
    .domain([array.min(values) || 0, array.max(values) || 0])
    .range([height - 20, 20]), [values, height]);

  return {
    x,
    y,
    values,
  };
} 