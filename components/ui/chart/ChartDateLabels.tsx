import React from 'react';
import { View, Text } from 'react-native';
import Colors from '@/constants/Colors';

interface ChartDateLabelsProps {
  showDateLabels: boolean;
  data: any[];
  formatDateLabel: (date: string) => string;
  margin: number;
}

export function ChartDateLabels({
  showDateLabels,
  data,
  formatDateLabel,
  margin,
}: ChartDateLabelsProps) {
  if (!showDateLabels || data.length === 0) return null;

  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: margin + 5,
      marginTop: 0,
      marginBottom: 8,
    }}>
      <Text style={{
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        color: Colors.gray[500],
      }}>
        {formatDateLabel(data[0].x)}
      </Text>
      <Text style={{
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        color: Colors.gray[500],
      }}>
        {formatDateLabel(data[data.length - 1].x)}
      </Text>
    </View>
  );
} 