import { useMemo } from 'react';
import { Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export function useChartDimensions(margin: number = 16) {
  const chartWidth = useMemo(() => {
    return screenWidth - (2 * 16) - (2 * 28);
  }, []);

  return {
    chartWidth,
    screenWidth,
  };
} 