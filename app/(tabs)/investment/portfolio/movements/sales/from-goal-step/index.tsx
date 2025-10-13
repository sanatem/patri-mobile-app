import React from 'react';
import { View, Text } from 'react-native';
import FormLayout from '@/components/ui/FormLayout';
import { Select } from '@/components/ui/Select';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/Colors';

interface FromGoalStepProps {
  goal: string | undefined;
  setGoal: (v: string) => void;
  destino: string | undefined;
  setDestino: (v: string) => void;
  onNext: () => void;
  onCancel: () => void;
  goals: { label: string; value: string }[];
  destinos: { label: string; value: string }[];
  cashBalance: number;
  hasGoalsWithBalance: boolean;
}

export default function FromGoalStep({
  goal,
  setGoal,
  destino,
  setDestino,
  onNext,
  onCancel,
  goals,
  destinos,
  cashBalance,
  hasGoalsWithBalance
}: FromGoalStepProps) {
  const { t } = useTranslation();

  // Validación: deshabilitar si no hay metas con saldo y el saldo en caja es 0
  const cannotWithdraw = !hasGoalsWithBalance && cashBalance === 0;
  const isNextDisabled = !goal || (goal !== 'cash-balance' && !destino) || cannotWithdraw;

  return (
    <FormLayout
      title={t('salesFlow.fromGoalStep.title')}
      subtitle=''
      currentStep={1}
      totalSteps={3}
      onNext={onNext}
      onCancel={onCancel}
      nextButtonTitle={t('salesFlow.next')}
      isNextDisabled={isNextDisabled}
      showLogo={false}
    >
      <Select
        label={t('fromGoalStep.from.part2')}
        options={goals}
        value={goal}
        onSelect={setGoal}
        placeholder={t('fromGoalStep.goalPlaceholder')}
      />

      {goal && goal !== 'cash-balance' && destinos.length > 0 && (
        <Select
          label={t('fromGoalStep.to.part2')}
          options={destinos}
          value={destino}
          onSelect={setDestino}
          placeholder={t('fromGoalStep.destinationPlaceholder')}
        />
      )}

      {goal === 'cash-balance' && (
        <View className="mt-1" style={{ borderWidth: 1, borderColor: Colors.primary[200], padding: 10, borderRadius: 16, marginTop: -20}}>
          <Text className="text-sm font-regular" style={{ color: Colors.primary[600] }}>
            {t('salesFlow.cashBalanceInfo')}
          </Text>
        </View>
      )}
    </FormLayout>
  );
} 