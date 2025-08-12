import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { ChevronLeft, X } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Header } from '@/components/ui/Header';
import { Container } from '@/components/ui/Container';
import GoalSelectionStep from './goal-step';
import AmountStep from './amount-step';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

type Step = 'goal-step' | 'amount-step';

export default function InvestmentMovementFlow() {
  const { t } = useTranslation();
  const router = useRouter();
  const { from = 'Emergencias' } = useLocalSearchParams();
  const [currentStep, setCurrentStep] = useState<Step>('goal-step');
  const [selectedGoal, setSelectedGoal] = useState('Reserva');
  const [amount, setAmount] = useState('');

  const handleContinueGoalSelection = () => {
    setCurrentStep('amount-step');
  };

  const handleFinish = () => {
    Keyboard.dismiss();
    router.push('/investment/portfolio' as any);
  };

  const getHeaderTitle = () => {
    switch (currentStep) {
      case 'goal-step':
        return t('investmentMovement.header.from', { from });
      case 'amount-step':
        return t('investmentMovement.header.amount');
      default:
        return '';
    }
  };

  const handleBack = () => {
    if (currentStep === 'amount-step') {
      setCurrentStep('goal-step');
    } else {
      router.push('/investment/portfolio' as any);
    }
  };

  return (
    <Container variant="secondaryPage" className="px-1">
      <Header 
        title={getHeaderTitle()}
        leftAction={
          <TouchableOpacity
            onPress={handleBack}
            className="p-1"
          >
            <ChevronLeft size={24} color={Colors.primary[500]} />
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        {currentStep === 'goal-step' && (
          <GoalSelectionStep
            selectedGoal={selectedGoal}
            onGoalSelect={setSelectedGoal}
            onContinue={handleContinueGoalSelection}
          />
        )}
        
        {currentStep === 'amount-step' && (
          <AmountStep
            amount={amount}
            onAmountChange={setAmount}
            onFinish={handleFinish}
          />
        )}
      </KeyboardAvoidingView>
    </Container>
  );
} 