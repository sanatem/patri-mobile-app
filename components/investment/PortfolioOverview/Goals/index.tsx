import React from 'react';
import { View, Text } from 'react-native';
import { PiggyBank, TrendingUp, Wallet } from 'lucide-react-native';
import { ListItem } from '@/components/ui/ListItem';
import { SkeletonBase } from '@/components/ui/SkeletonBase';
import { Button } from '@/components/ui/Button';
import Colors from '@/constants/Colors';
import { listItemStyles } from '@/styles/ui/ListItem.styles';
import { useFormatValue } from '@/hooks/common/useFormatValue';
import type { Goal } from '@/types/api';

interface GoalsSectionProps {
  selectedAccountType: string;
  goalsLoading: boolean;
  goalsError: any;
  currentGoals: Goal[];
  onGoalPress: (goal: Goal) => void;
  onRetry: () => void;
  t: (key: string) => string;
}

export function GoalsSection({
  selectedAccountType,
  goalsLoading,
  goalsError,
  currentGoals,
  onGoalPress,
  onRetry,
  t,
}: GoalsSectionProps) {
  const { formatValue } = useFormatValue();

  if (goalsLoading) {
    return (
      <View style={{ padding: 20 }}>
        {Array.from({ length: 3 }).map((_, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 18,
              paddingHorizontal: 20,
              backgroundColor: '#fff',
              borderBottomWidth: 1,
              borderBottomColor: '#f3f4f6'
            }}
          >
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
            <View style={{ flex: 1, marginRight: 12 }}>
              <SkeletonBase
                width={180}
                height={40}
                x={0}
                y={0}
                rows={2}
                rowHeight={20}
                rowWidth={180}
                rowSpacing={4}
                borderRadius={4}
              />
            </View>
            <SkeletonBase
              width={80}
              height={20}
              x={0}
              y={0}
              rows={1}
              rowHeight={20}
              rowWidth={80}
              borderRadius={4}
            />
          </View>
        ))}
      </View>
    );
  }

  if (goalsError) {
    return (
      <View className="flex-1 justify-center items-center py-8">
        <Text className="text-red-500 mb-4">
          {selectedAccountType === 'investment' ? t('portfolio.goalsError') : t('portfolio.savingInstrumentsError')}
        </Text>
        <Button title={t('common.retry')} onPress={onRetry} />
      </View>
    );
  }

  if (currentGoals.length === 0) {
    return (
      <View className="flex-1 justify-center items-center py-8">
        <View className="w-16 h-16 rounded-full bg-gray-100 justify-center items-center mb-4">
          {selectedAccountType === 'investment' ? (
            <TrendingUp size={32} color={Colors.gray[400]} />
          ) : (
            <Wallet size={32} color={Colors.gray[400]} />
          )}
        </View>
        <Text className="text-center font-medium" style={{ color: Colors.gray[400] }}>
          {selectedAccountType === 'investment' ? t('portfolio.noGoals') : t('portfolio.noSavingInstruments')}
        </Text>
      </View>
    );
  }

  return (
    <>
      <View className="px-6 py-2">
        <Text className="text-lg font-medium text-gray-800">
          {selectedAccountType === 'investment' ? t('portfolio.goalsTitle') : t('portfolio.savingsTitle')}
        </Text>
      </View>

      <View style={listItemStyles.cardContainer}>
        <ListItem
          data={currentGoals.map(goal => ({
            id: goal.id,
            title: goal.name,
            subtitle: `${t('portfolio.goalPrefix')} ${formatValue(goal.targetAmount.toString())} - ${goal.targetDate}`,
            value: formatValue(goal.currentAmount.toString()),
            icon: {
              component: <PiggyBank size={24} color={Colors.secondary[500]} />,
              backgroundColor: Colors.secondary[50],
              color: Colors.secondary[500],
              text: goal.name.charAt(0)
            },
            onPress: () => onGoalPress(goal),
          }))}
          showLoadMore={false}
          showContainer={false}
        />
      </View>
    </>
  );
}
