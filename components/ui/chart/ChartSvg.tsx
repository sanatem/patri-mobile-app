import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Line } from 'react-native-svg';
import Colors from '@/constants/Colors';

interface ChartSvgProps {
  chartWidth: number;
  height: number;
  margin: number;
  gradientId: string;
  lineColor: string;
  area: string | null;
  greenLine: string | null;
  grayLine: string | null;
  normalLine: string | null;
  showDynamicColors: boolean;
  cx: number;
  cy: number;
  isDragging: boolean;
  panResponder: any;
}

export function ChartSvg({
  chartWidth,
  height,
  margin,
  gradientId,
  lineColor,
  area,
  greenLine,
  grayLine,
  normalLine,
  showDynamicColors,
  cx,
  cy,
  isDragging,
  panResponder,
}: ChartSvgProps) {
  return (
    <View style={{ height: height + 20, marginBottom: 4 }}>        
      <View style={{ marginHorizontal: margin }}>
        <View style={{ width: chartWidth, height, position: 'relative' }}>
          <Svg width={chartWidth} height={height}>
            <Defs>
              <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={lineColor} stopOpacity={0.2} />
                <Stop offset="100%" stopColor={lineColor} stopOpacity={0.05} />
              </LinearGradient>
            </Defs>
            {area && <Path d={area} fill={`url(#${gradientId})`} />}
            
            {showDynamicColors ? (
              <>
                {greenLine && <Path d={greenLine} fill="none" stroke={lineColor} strokeWidth={2.5} />}
                {grayLine && <Path d={grayLine} fill="none" stroke={Colors.gray[200]} strokeWidth={2.5} />}
              </>
            ) : (
              normalLine && <Path d={normalLine} fill="none" stroke={lineColor} strokeWidth={2.5} />
            )}

            <Line
              x1={cx}
              x2={cx}
              y1={0}
              y2={height}
              stroke={Colors.gray[200]}
              strokeDasharray="4,4"
            />

            <Circle 
              cx={cx} 
              cy={cy} 
              r={isDragging ? 18 : 14} 
              fill="rgba(34,197,94,0.2)" 
            />
            <Circle 
              cx={cx} 
              cy={cy} 
              r={isDragging ? 9 : 7} 
              fill={lineColor} 
            />
          </Svg>
          
          <View 
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: chartWidth, 
              height,
              backgroundColor: 'transparent',
              zIndex: 10
            }} 
            {...panResponder.panHandlers}
          />
        </View>
      </View>
    </View>
  );
} 