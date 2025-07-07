import { useMemo } from 'react';
import * as shape from 'd3-shape';
import * as array from 'd3-array';

interface ChartDataPoint {
  x: string;
  y: number; 
}

export function useChartPaths(
  data: ChartDataPoint[],
  x: any,
  y: any,
  values: number[],
  activeIndex: number,
  showDynamicColors: boolean
) {
  // Área dinámica
  const area = useMemo(() => {
    if (data.length === 0) return null;
    
    const areaData = showDynamicColors && activeIndex >= 0 
      ? data.slice(0, activeIndex + 1)
      : data;
      
    if (areaData.length < 2) return null;
    
    return shape
      .area<ChartDataPoint>()
      .x((_, i) => x(showDynamicColors ? i : i))
      .y0(() => y(array.min(values) || 0))
      .y1((d) => y(d.y))
      .curve(shape.curveMonotoneX)(areaData);
  }, [data, x, y, values, activeIndex, showDynamicColors]);

  // Línea verde (desde el inicio hasta el punto activo)
  const greenLine = useMemo(() => {
    if (!showDynamicColors || data.length === 0 || activeIndex < 0) return null;
    
    const greenData = data.slice(0, activeIndex + 1);
    if (greenData.length < 2) return null;
    
    return shape
      .line<ChartDataPoint>()
      .x((_, i) => x(i))
      .y((d) => y(d.y))
      .curve(shape.curveMonotoneX)(greenData);
  }, [data, x, y, activeIndex, showDynamicColors]);

  const grayLine = useMemo(() => {
    if (!showDynamicColors || data.length === 0 || activeIndex >= data.length - 1) return null;
    
    const grayData = data.slice(activeIndex);
    if (grayData.length < 2) return null;
    
    return shape
      .line<ChartDataPoint>()
      .x((_, i) => x(i + activeIndex))
      .y((d) => y(d.y))
      .curve(shape.curveMonotoneX)(grayData);
  }, [data, x, y, activeIndex, showDynamicColors]);

  // Línea normal (cuando no hay colores dinámicos)
  const normalLine = useMemo(() => {
    if (showDynamicColors || data.length === 0) return null;
    
    return shape
      .line<ChartDataPoint>()
      .x((_, i) => x(i))
      .y((d) => y(d.y))
      .curve(shape.curveMonotoneX)(data);
  }, [data, x, y, showDynamicColors]);

  return {
    area,
    greenLine,
    grayLine,
    normalLine,
  };
} 