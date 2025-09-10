import React from 'react';
import FormLayout from '@/components/ui/FormLayout';
import { Select } from '@/components/ui/Select';
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

export default function FromGoalStep({ 
  goal, 
  setGoal, 
  destino, 
  setDestino, 
  onNext, 
  mockGoals, 
  mockDestinos 
}: FromGoalStepProps) {
  const { t } = useTranslation();
  
  return (
    <FormLayout
      title={t('salesFlow.fromGoalStep.title')}
      subtitle={t('salesFlow.fromGoalStep.subtitle')}
      currentStep={1}
      totalSteps={3}
      onNext={onNext}
      nextButtonTitle={t('salesFlow.next')}
      isNextDisabled={!goal || !destino}
      showLogo={false}
    >
      <Select
        label={t('fromGoalStep.from.part2')}
        options={mockGoals}
        value={goal}
        onSelect={setGoal}
        placeholder={t('fromGoalStep.goalPlaceholder')}
      />

      {goal && (
        <Select
          label={t('fromGoalStep.to.part2')}
          options={mockDestinos}
          value={destino}
          onSelect={setDestino}
          placeholder={t('fromGoalStep.destinationPlaceholder')}
        />
      )}
    </FormLayout>
  );
} 