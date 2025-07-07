import React from 'react';
import { View, Text } from 'react-native';
import Colors from '@/constants/Colors';
import { TooltipData } from '@/types/chart';

interface ChartTooltipProps {
  tooltipData: TooltipData;
  onTooltipRender?: (data: TooltipData) => React.ReactNode;
  tooltipStyle?: any;
  defaultTooltipStyle: any;
}

export function ChartTooltip({
  tooltipData,
  onTooltipRender,
  tooltipStyle,
  defaultTooltipStyle,
}: ChartTooltipProps) {
  if (onTooltipRender) {
    return <>{onTooltipRender(tooltipData)}</>;
  }

  return (
    <View style={[defaultTooltipStyle, tooltipStyle]}>
      <Text style={{
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        color: Colors.gray[500],
        textAlign: 'center',
        marginBottom: 4,
      }}>
        {tooltipData.date}
      </Text>
      <Text style={{
        fontFamily: 'Poppins-SemiBold',
        fontSize: 16,
        color: Colors.gray[700],
        textAlign: 'center',
      }}>
        {tooltipData.value}
      </Text>
    </View>
  );
} 