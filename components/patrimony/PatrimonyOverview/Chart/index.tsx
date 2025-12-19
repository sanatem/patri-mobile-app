import React from 'react';
import AreaChart from '@/components/patrimony/PatrimonyOverview/Chart/AreaChart';
import { TimeRangeSelector } from './TimeRangeSelector';
import { RangeSize } from '@/store/chartRangeStore';
import { Animated } from 'react-native';

interface ChartSectionProps {
  timeRangeOptions: Array<{ label: string; value: string }>;
  rangeSize: RangeSize;
  onRangeChange: (value: RangeSize) => void;
  showSkeletons: boolean;
  skeletonFadeAnim: Animated.Value;
}

export function ChartSection({
  timeRangeOptions,
  rangeSize,
  onRangeChange,
  showSkeletons,
  skeletonFadeAnim
}: ChartSectionProps) {
  return (
    <>
      <TimeRangeSelector
        timeRangeOptions={timeRangeOptions}
        rangeSize={rangeSize}
        onRangeChange={onRangeChange}
        showSkeletons={showSkeletons}
        skeletonFadeAnim={skeletonFadeAnim}
      />
      {/* <AreaChart /> */}
    </>
  );
}
