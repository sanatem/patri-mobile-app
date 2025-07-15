import React from 'react';
import ContentLoader, { Rect } from 'react-content-loader/native';
import Colors from '@/constants/Colors';

interface SkeletonBaseProps {
  rows?: number;
  rowHeight?: number;
  rowWidth?: number | ((index: number) => number);
  rowSpacing?: number;
  borderRadius?: number;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  style?: any;
}

export const SkeletonBase: React.FC<SkeletonBaseProps> = ({
  rows = 1,
  rowHeight = 20,
  rowWidth = 300,
  rowSpacing = 12,
  borderRadius = 8,
  width = 360,
  height = 80,
  x = 20,
  y = 20,
  style,
  ...props
}) => {
  return (
    <ContentLoader
      speed={2}
      width={width}
      height={height}
      backgroundColor={Colors.gray[100]}
      foregroundColor={Colors.gray[200]}
      style={style}
      {...props}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <Rect
          key={i}
          x={x}
          y={y + i * (rowHeight + rowSpacing)}
          rx={borderRadius}
          ry={borderRadius}
          width={typeof rowWidth === 'function' ? rowWidth(i) : rowWidth}
          height={rowHeight}
        />
      ))}
    </ContentLoader>
  );
}; 