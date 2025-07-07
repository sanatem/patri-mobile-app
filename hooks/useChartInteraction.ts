import { useState, useMemo, useEffect } from 'react';
import { PanResponder, LayoutAnimation } from 'react-native';

export function useChartInteraction(
  data: any[],
  chartWidth: number
) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (data.length > 0) {
      setActiveIndex(data.length - 1);
    }
  }, [data.length]);

  useEffect(() => {
    LayoutAnimation.configureNext({
      duration: 300,
      create: {
        type: LayoutAnimation.Types.spring,
        property: LayoutAnimation.Properties.scaleXY,
        springDamping: 0.7,
      },
      update: {
        type: LayoutAnimation.Types.spring,
        property: LayoutAnimation.Properties.scaleXY,
        springDamping: 0.7,
      },
    });
  }, [activeIndex]);

  const calculateIndexFromTouch = (touchX: number): number => {
    if (data.length === 0) return 0;
    
    const progress = touchX / chartWidth;
    const index = Math.round(progress * (data.length - 1));
    return Math.max(0, Math.min(data.length - 1, index));
  };

  const panResponder = useMemo(() => 
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      onPanResponderGrant: (evt) => {
        setIsDragging(true);
        const index = calculateIndexFromTouch(evt.nativeEvent.locationX);
        setActiveIndex(index);
      },
      
      onPanResponderMove: (evt) => {
        const index = calculateIndexFromTouch(evt.nativeEvent.locationX);
        setActiveIndex(index);
      },
      
      onPanResponderRelease: () => {
        setIsDragging(false);
      },
      
      onPanResponderTerminate: () => {
        setIsDragging(false);
      },
    }), [data.length, chartWidth]
  );

  return {
    activeIndex,
    isDragging,
    panResponder,
    setActiveIndex,
  };
} 