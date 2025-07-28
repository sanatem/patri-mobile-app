import React from 'react';
import Svg, { Path } from 'react-native-svg';
import Colors from '@/constants/Colors';

interface LineChartIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const LineChartIcon = ({ 
  width = 80, 
  height = 80, 
  color = Colors.primary[500] 
}: LineChartIconProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 80 80">
      <Path
        d="M15 50L25 45L35 48L45 35L55 40L65 25L70 20"
        stroke={color}
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default LineChartIcon; 