import React, { useState } from 'react';
import { TouchableOpacity, KeyboardAvoidingView, Platform, View, ScrollView } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Header } from '@/components/ui/Header';
import { Container } from '@/components/ui/Container';
import Colors from '@/constants/Colors';
import FromGoalStep from './from-goal-step';
import FromAssetStep from './from-asset-step';
import ConfirmationStep from './confirmation-step';
import { PortfolioActionsBar } from '@/components/investment/portfolio/PortfolioActionsBar';
import { useTranslation } from 'react-i18next';



export default function SalesFlow() {
  const { t } = useTranslation();
  const mockGoals = [
    { label: t('salesFlow.mockGoals.newGoal'), value: 'nueva-meta' },
    { label: t('salesFlow.mockGoals.cashBalance'), value: 'saldo-caja' },
  ];
  const mockDestinos = [
    { label: t('salesFlow.mockDestinos.bankAccount'), value: 'cuenta-bancaria' },
    { label: t('salesFlow.mockDestinos.cashBalance'), value: 'saldo-caja' },
  ];

  const mockActivos = [
    { label: t('salesFlow.mockActivos.option1'), value: 'activo-1' },
    { label: t('salesFlow.mockActivos.option2'), value: 'todo-portafolio' },
    { label: t('salesFlow.mockActivos.option3'), value: 'proporcional' },
  ];
  const mockCuentas = [
    { label: t('salesFlow.mockCuentas.account1'), value: 'ca-6677' },
  ];
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<string | undefined>();
  const [destino, setDestino] = useState<string | undefined>();
  const [activo, setActivo] = useState<string | undefined>();
  const [cuenta, setCuenta] = useState<string | undefined>(mockCuentas[0].value);

  const handleBack = () => {
    if (step === 1) {
      router.push('/investment/portfolio');
    } else {
      setStep(step - 1);
    }
  };

  const getActionsForStep = () => {
    if (step === 1) {
      return [
        {
          title: t('salesFlow.next'),
          variant: 'primary' as const,
          onPress: () => setStep(2),
          disabled: !goal || !destino,
          fullWidth: true,
        },
      ];
    }
    if (step === 2) {
      return [
        {
          title: t('salesFlow.previous'),
          variant: 'outline' as const,
          onPress: () => setStep(1),
        },
        {
          title: t('salesFlow.next'),
          variant: 'primary' as const,
          onPress: () => setStep(3),
          disabled: !activo || (destino === 'cuenta-bancaria' && !cuenta),
        },
      ];
    }
    if (step === 3) {
      return [
        {
          title: t('salesFlow.previous'),
          variant: 'outline' as const,
          onPress: () => setStep(2),
        },
        {
          title: t('salesFlow.finish'),
          variant: 'primary' as const,
          onPress: () => router.push('/investment/portfolio'),
        },
      ];
    }
    return [];
  };

  return (
    <Container variant="secondaryPage" className="px-1 flex-1">
      <Header
        title={t('salesFlow.header')}
        leftAction={
          <TouchableOpacity onPress={handleBack} className="p-1">
            <ChevronLeft size={24} color={Colors.primary[500]} />
          </TouchableOpacity>
        }
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
            {step === 1 && (
              <FromGoalStep
                goal={goal}
                setGoal={setGoal}
                destino={destino}
                setDestino={setDestino}
                mockGoals={mockGoals}
                mockDestinos={mockDestinos}
                onNext={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <FromAssetStep
                activo={activo}
                setActivo={setActivo}
                destino={destino}
                cuenta={cuenta}
                setCuenta={setCuenta}
                mockActivos={mockActivos}
                mockCuentas={mockCuentas}
                onNext={() => setStep(3)}
                onPrev={() => setStep(1)}
              />
            )}
            {step === 3 && (
              <ConfirmationStep
                activo={activo}
                mockActivos={mockActivos}
                destino={destino}
                onPrev={() => setStep(2)}
                onFinish={() => router.push('/investment/portfolio')}
              />
            )}
          </ScrollView>
          <View className="px-3">
            <PortfolioActionsBar actions={getActionsForStep()} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Container>
  );
}
