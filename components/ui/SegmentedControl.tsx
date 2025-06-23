import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { segmentedControlStyles } from '@/styles/ui/SegmentedControl.styles';
import Colors from '@/constants/Colors';

export interface SegmentedControlOption {
  label: string;
  value: string;
}

export interface SegmentedControlColors {
  background?: string;
  border?: string;
  activeBg?: string;
  activeText?: string;
  inactiveBg?: string;
  inactiveText?: string;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  style?: ViewStyle;
  colors?: SegmentedControlColors;
}

const defaultColors: SegmentedControlColors = {
  background: Colors.segmentedControl.background,
  border: Colors.segmentedControl.border,
  activeBg: Colors.segmentedControl.activeBg,
  activeText: Colors.segmentedControl.activeText,
  inactiveBg: Colors.segmentedControl.inactiveBg,
  inactiveText: Colors.segmentedControl.inactiveText,
};

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  style,
  colors = {},
}) => {
  const mergedColors = { ...defaultColors, ...colors };
  return (
    <View
      style={[
        segmentedControlStyles.container,
        {
          backgroundColor: mergedColors.background,
          borderColor: mergedColors.border,
        },
        style,
      ]}
    >
      {options.map((option, idx) => {
        const isActive = value === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[
              segmentedControlStyles.option,
              isActive ? { flex: 2 } : { flex: 1 },
              isActive && {
                backgroundColor: mergedColors.activeBg,
                shadowColor: mergedColors.activeBg,
                elevation: 2,
              },
              !isActive && { backgroundColor: mergedColors.inactiveBg },
            ]}
            activeOpacity={0.85}
            onPress={() => onChange(option.value)}
          >
            <Text
              style={[
                segmentedControlStyles.optionText,
                isActive
                  ? { color: mergedColors.activeText, fontWeight: 'bold', fontSize: 16 }
                  : { color: mergedColors.inactiveText, fontSize: 12 },
              ]}
              numberOfLines={1}
              {...(!isActive && { adjustsFontSizeToFit: true })}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}; 