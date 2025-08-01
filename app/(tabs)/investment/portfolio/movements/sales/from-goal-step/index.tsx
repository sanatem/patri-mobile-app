import React from 'react';
import { View, Text } from 'react-native';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import Colors from '@/constants/Colors';
import { Container } from '@/components/ui/Container';
import { useTranslation } from 'react-i18next';

interface FromGoalStepProps {
  goal: string | undefined;
  setGoal: (v: string) => void;
  destino: string | undefined;
  setDestino: (v: string) => void;
  onNext: () => void;
  mockGoals: { label: string; value: string }[];
  mockDestinos: { label: string; value: string }[];
}

export default function FromGoalStep({ goal, setGoal, destino, setDestino, onNext, mockGoals, mockDestinos }: FromGoalStepProps) {
  const { t } = useTranslation();
  return (
    <Container variant="secondaryPage" className="px-3">
      <Text className="text-base font-regular mb-2" style={{ color: Colors.primary[500] }}>
        {t('fromGoalStep.from.part1')} <Text className="font-semibold">{t('fromGoalStep.from.part2')}</Text> {t('fromGoalStep.from.part3')}
      </Text>

      <Select
        options={mockGoals}
        value={goal}
        onSelect={setGoal}
        placeholder={t('fromGoalStep.goalPlaceholder')}
      />

      {goal && (
        <>
          <Text className="text-base font-regular mb-2" style={{ color: Colors.primary[500] }}>
            {t('fromGoalStep.to.part1')} <Text className="font-semibold">{t('fromGoalStep.to.part2')}</Text> {t('fromGoalStep.to.part3')}
          </Text>
          <Select
            options={mockDestinos}
            value={destino}
            onSelect={setDestino}
            placeholder={t('fromGoalStep.destinationPlaceholder')}
          />
        </>
      )}
    </Container>
  );
} 