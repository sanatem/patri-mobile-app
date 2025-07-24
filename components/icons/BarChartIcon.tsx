import React from 'react';
import Svg, { Rect } from 'react-native-svg';
import Colors from '@/constants/Colors';

interface BarChartIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const BarChartIcon = ({ 
  width = 80, 
  height = 80, 
  color = Colors.primary[500] 
}: BarChartIconProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 80 80">
      <Rect
        x="20"
        y="50"
        width="8"
        height="20"
        fill={color}
        rx="3.5"
      />
      <Rect
        x="35"
        y="30"
        width="8"
        height="40"
        fill={color}
        rx="3.5"
      />
      <Rect
        x="50"
        y="40"
        width="8"
        height="30"
        fill={color}
        rx="3.5"
      />
    </Svg>
  );
};

export default BarChartIcon; 