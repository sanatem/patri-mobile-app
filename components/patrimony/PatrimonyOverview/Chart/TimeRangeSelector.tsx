import React from 'react';
import { Animated } from 'react-native';
import { Container, SegmentedControl } from '@/components/ui';
import { SkeletonBase } from '@/components/ui/SkeletonBase';
import { RangeSize } from '@/store/chartRangeStore';

interface TimeRangeSelectorProps {
  timeRangeOptions: Array<{ label: string; value: string }>;
  rangeSize: RangeSize;
  onRangeChange: (value: RangeSize) => void;
  showSkeletons: boolean;
  skeletonFadeAnim: Animated.Value;
}

export function TimeRangeSelector({
  timeRangeOptions,
  rangeSize,
  onRangeChange,
  showSkeletons,
  skeletonFadeAnim
}: TimeRangeSelectorProps) {
  if (showSkeletons) {
    return (
      <Container variant="content" className="mb-4 mt-4">
        <Animated.View style={{ opacity: skeletonFadeAnim }}>
          <SkeletonBase
            width={375}
            height={56}
            x={0}
            y={0}
            rows={1}
            rowHeight={56}
            rowWidth={375}
            borderRadius={16}
          />
        </Animated.View>
      </Container>
    );
  }

  return (
    <Container variant="content" className="mb-4 mt-4">
      <SegmentedControl
        options={timeRangeOptions}
        value={rangeSize}
        onChange={(val) => onRangeChange(val as RangeSize)}
      />
    </Container>
  );
}
