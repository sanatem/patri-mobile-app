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

const mockGoals = [
  { label: 'Nueva meta ($1.492.500,00)', value: 'nueva-meta' },
  { label: 'Saldo en caja ($7.560,00)', value: 'saldo-caja' },
];
const mockDestinos = [
  { label: 'Mi cuenta bancaria', value: 'cuenta-bancaria' },
  { label: 'Mi saldo en caja', value: 'saldo-caja' },
];
const mockActivos = [
  { label: 'Singular Chile Deuda Corta Duración CFIETFCD\n$1.492.500 CLP al 10/05/2023 · 14.925,0 cuotas', value: 'activo-1' },
  { label: 'Todo mi portafolio\n$1.492.500 CLP al 26/06/2025', value: 'todo-portafolio' },
  { label: 'Retiro proporcional\nMantiene la estructura del portafolio', value: 'proporcional' },
];
const mockCuentas = [
  { label: 'CA 6677 · Chile-Edwards', value: 'ca-6677' },
];

export default function SalesFlow() {
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
          title: 'Siguiente',
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
          title: 'Anterior',
          variant: 'outline' as const,
          onPress: () => setStep(1),
        },
        {
          title: 'Siguiente',
          variant: 'primary' as const,
          onPress: () => setStep(3),
          disabled: !activo || (destino === 'cuenta-bancaria' && !cuenta),
        },
      ];
    }
    if (step === 3) {
      return [
        {
          title: 'Anterior',
          variant: 'outline' as const,
          onPress: () => setStep(2),
        },
        {
          title: 'Finalizar',
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
        title="Solicitud de retiro"
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
            <PortfolioActionsBar
              actions={getActionsForStep()}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Container>
  );
} 