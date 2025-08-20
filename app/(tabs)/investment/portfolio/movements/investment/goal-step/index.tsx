import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

interface GoalSelectionStepProps {
  selectedGoal?: string;
  onGoalSelect?: (goal: string) => void;
  onContinue?: () => void;
}

export default function GoalSelectionStep({
  selectedGoal: initialGoal = '',
  onGoalSelect,
  onContinue,
}: GoalSelectionStepProps) {
  const [selectedGoal, setSelectedGoal] = useState(initialGoal);

  const { t } = useTranslation();
  const goalOptions = [
    { label: t('portfolio.cards.reserva.title'), value: 'Reserva' },
    { label: t('portfolio.cards.casa.title'), value: 'Casa' },
    { label: t('portfolio.cards.jubilacion.title'), value: 'Mejorar mi jubilación' },
  ];

  const handleGoalSelect = (goal: string) => {
    setSelectedGoal(goal);
    if (onGoalSelect) {
      onGoalSelect(goal);
    }
  };

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    }
  };

  return (
    <Container variant="secondaryPage">
      <ScrollView 
        className="flex-1 px-3" 
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-base font-regular mb-6" style={{ color: Colors.primary[500] }}>
          {t('fromGoalStep.metaTo.part1')} <Text className="font-semibold">{t('fromGoalStep.metaTo.part2')}</Text> {t('fromGoalStep.metaTo.part3')}
        </Text>

        <Select
          options={goalOptions}
          value={selectedGoal}
          onSelect={handleGoalSelect}
          placeholder={t('fromGoalStep.goalPlaceholder')}
          className="mb-4"
        />
      </ScrollView>

      <View className="mb-4 mt-4 px-3">
        <Button
          title={t('common.continue')}
          variant="primary"
          onPress={handleContinue}
          fullWidth
          disabled={!selectedGoal}
        />
      </View>
    </Container>
  );
} 