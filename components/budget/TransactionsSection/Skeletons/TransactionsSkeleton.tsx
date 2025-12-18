import React from 'react';
import { View } from 'react-native';
import { SkeletonBase } from '@/components/ui/SkeletonBase';
import { listItemStyles } from '@/styles/ui/ListItem.styles';
import Colors from '@/constants/Colors';

interface TransactionsSkeletonProps {
  contentWidth: number;
}

export function TransactionsSkeleton({ contentWidth }: TransactionsSkeletonProps) {
  return (
    <View style={listItemStyles.cardContainer}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 20,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 4,
        marginHorizontal: 0,
        marginBottom: 10
      }}>
        <SkeletonBase
          width={contentWidth * 0.4}
          height={18}
          x={0}
          y={0}
          rows={1}
          rowHeight={18}
          rowWidth={contentWidth * 0.4}
          borderRadius={4}
          style={{ marginRight: 20 }}
        />
        <SkeletonBase
          width={contentWidth * 0.4}
          height={18}
          x={0}
          y={0}
          rows={1}
          rowHeight={18}
          rowWidth={contentWidth * 0.4}
          borderRadius={4}
        />
      </View>

      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray[200]
      }}>
        <SkeletonBase
          width={contentWidth * 0.35}
          height={18}
          x={0}
          y={0}
          rows={1}
          rowHeight={18}
          rowWidth={contentWidth * 0.35}
          borderRadius={4}
        />
        <SkeletonBase
          width={contentWidth * 0.3}
          height={18}
          x={0}
          y={0}
          rows={1}
          rowHeight={18}
          rowWidth={contentWidth * 0.3}
          borderRadius={4}
        />
      </View>

      {Array.from({ length: 5 }).map((_, index) => (
        <View key={index} style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 18,
          paddingHorizontal: 20,
          borderBottomWidth: index < 4 ? 1 : 0,
          borderBottomColor: Colors.gray[200]
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <SkeletonBase
              width={48}
              height={48}
              x={0}
              y={0}
              rows={1}
              rowHeight={48}
              rowWidth={48}
              borderRadius={12}
              style={{ marginRight: 18 }}
            />
            <View style={{ flex: 1 }}>
              <SkeletonBase
                width={contentWidth * 0.45}
                height={16}
                x={0}
                y={0}
                rows={1}
                rowHeight={16}
                rowWidth={contentWidth * 0.45}
                borderRadius={4}
                style={{ marginBottom: 4 }}
              />
              <SkeletonBase
                width={contentWidth * 0.35}
                height={13}
                x={0}
                y={0}
                rows={1}
                rowHeight={13}
                rowWidth={contentWidth * 0.35}
                borderRadius={4}
              />
            </View>
          </View>
          <View style={{ alignItems: 'flex-end', minWidth: 90 }}>
            <SkeletonBase
              width={contentWidth * 0.25}
              height={16}
              x={0}
              y={0}
              rows={1}
              rowHeight={16}
              rowWidth={contentWidth * 0.25}
              borderRadius={4}
              style={{ marginBottom: 4 }}
            />
            <SkeletonBase
              width={contentWidth * 0.2}
              height={14}
              x={0}
              y={0}
              rows={1}
              rowHeight={14}
              rowWidth={contentWidth * 0.2}
              borderRadius={4}
            />
          </View>
        </View>
      ))}
    </View>
  );
}
