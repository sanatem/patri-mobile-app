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

type Step = 'goal-step' | 'amount-step';

export default function InvestmentMovementFlow() {
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
    router.push('/investment/portfolio/portfolio' as any);
  };

  const getHeaderTitle = () => {
    switch (currentStep) {
      case 'goal-step':
        return `Mover desde 🚒 ${from}`;
      case 'amount-step':
        return 'Ingresar monto';
      default:
        return '';
    }
  };

  const handleBack = () => {
    if (currentStep === 'amount-step') {
      setCurrentStep('goal-step');
    } else {
      router.back();
    }
  };

  return (
    <Container variant="secondaryPage" style={{ padding: 20 }}>
      <Header 
        title={getHeaderTitle()}
        leftAction={
          <TouchableOpacity
            onPress={handleBack}
            className="p-1 mr-3"
          >
            <ChevronLeft size={24} color="#FF5603" />
          </TouchableOpacity>
        }
        rightAction={
          currentStep === 'amount-step' ? (
            <TouchableOpacity onPress={() => router.back()}>
              <X size={22} color="#6B7280" />
            </TouchableOpacity>
          ) : undefined
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