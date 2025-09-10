import React, { useState } from 'react';
import { Keyboard } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Container } from '@/components/ui/Container';
import GoalSelectionStep from './goal-step';
import SourceFundsStep from './source-funds-step';
import { useCash } from '@/hooks/cash/useCash';
import { useCreatePurchase } from '@/hooks/investment/useCreatePurchase';
import { useGoals } from '@/hooks/investment/useGoals';
import { useAuth } from '@/providers/AuthProvider';
import { useTranslation } from 'react-i18next';

type Step = 'goal-step' | 'source-funds-step';

export default function InvestmentMovementFlow() {
  console.log('InvestmentMovementFlow: Component rendering');
  const { t } = useTranslation();
  const router = useRouter();
  console.log('InvestmentMovementFlow: Router initialized successfully');
  const [currentStep, setCurrentStep] = useState<Step>('goal-step');
  const [selectedGoal, setSelectedGoal] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedSource, setSelectedSource] = useState('');

  const { cash } = useCash();
  const { goals } = useGoals();
  const { createPurchase, loading: purchaseLoading } = useCreatePurchase();
  const { user } = useAuth();

  const availableCashAmount = cash?.cash?.investment?.available_amount 
    ? parseFloat(cash.cash.investment.available_amount.toString()) 
    : 0;

  const handleGoalStepContinue = () => {
    setCurrentStep('source-funds-step');
  };

  const handleSourceStepPrevious = () => {
    setCurrentStep('goal-step');
  };

  const handleFinish = async () => {
    try {
      if (!user?.id || !selectedGoal || !amount || !selectedSource) {
        console.error('Datos faltantes para crear la compra');
        return;
      }

      // Si la fuente es Fintoc, abrir el portal directamente
      if (selectedSource === 'fintoc') {
        router.push({
          pathname: '/investment/portfolio/movements/investment/fintoc-portal',
          params: {
            amount: amount,
            goalId: selectedGoal,
          }
        } as any);
        return;
      }

      const accountInfo = goals.investment.accountInfo;
      if (!accountInfo) {
        throw new Error('No se encontró información de la cuenta de inversión');
      }

      const purchaseData = {
        type: 'deposit_intention' as const,
        user_id: parseInt(user.id),
        goal_id: parseInt(selectedGoal),
        investment_account_id: accountInfo.id,
        broker_portfolio_id: 10,
        amount: parseFloat(amount),
        source: selectedSource,
      };

      const result = await createPurchase(purchaseData);

      Keyboard.dismiss();
      router.push('/investment/portfolio' as any);
    } catch (error) {
      console.error('Error al crear la compra:', error);
    }
  };

  const handleCancel = () => {
    try {
      console.log('handleCancel: Navigating back to portfolio');
      router.push('/investment/portfolio' as any);
    } catch (error) {
      console.error('handleCancel: Navigation error:', error);
    }
  };

  return (
    <Container variant="secondaryPage">
      {currentStep === 'goal-step' && (
        <GoalSelectionStep
          selectedGoal={selectedGoal}
          onGoalSelect={setSelectedGoal}
          amount={amount}
          onAmountChange={setAmount}
          onContinue={handleGoalStepContinue}
          onCancel={handleCancel}
        />
      )}
      
      {currentStep === 'source-funds-step' && (
        <SourceFundsStep
          selectedSource={selectedSource}
          onSourceSelect={setSelectedSource}
          amount={parseFloat(amount) || 0}
          availableCashAmount={availableCashAmount}
          onContinue={handleFinish}
          onPrevious={handleSourceStepPrevious}
          loading={purchaseLoading}
        />
      )}
    </Container>
  );
} 