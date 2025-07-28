import React from 'react';
import Svg, { Path } from 'react-native-svg';
import Colors from '@/constants/Colors';

interface ShieldIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const ShieldIcon = ({ 
  width = 80, 
  height = 80, 
  color = Colors.primary[500] 
}: ShieldIconProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 80 80">
      <Path
        d="M40 8L8 20V40C8 56.5685 21.4315 70 38 70H42C58.5685 70 72 56.5685 72 40V20L40 8Z"
        stroke={color}
        strokeWidth="5"
        fill="none"
      />
    </Svg>
  );
};

export default ShieldIcon; 