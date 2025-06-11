import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { ChevronLeft, X } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import GoalSelectionStep from './goal-step';
import AmountStep from './amount-step';

type Step = 'goal-step' | 'amount-step';

export default function InvestmentMovementFlow() {
  const router = useRouter();
  const { from = 'Emergencias' } = useLocalSearchParams();
  const [currentStep, setCurrentStep] = useState<Step>('goal-step');
  const [selectedGoal, setSelectedGoal] = useState('Reserva');
  const [amount, setAmount] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <ChevronLeft size={24} color="#FF5603" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {getHeaderTitle()}
        </Text>
        {currentStep === 'amount-step' ? (
          <TouchableOpacity onPress={() => router.back()}>
            <X size={22} color="#6B7280" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      {/* Content */}
      {currentStep === 'goal-step' && (
        <GoalSelectionStep
          selectedGoal={selectedGoal}
          onGoalSelect={setSelectedGoal}
          onContinue={handleContinueGoalSelection}
          dropdownOpen={dropdownOpen}
          setDropdownOpen={setDropdownOpen}
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', paddingTop: 64 },
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
}); 