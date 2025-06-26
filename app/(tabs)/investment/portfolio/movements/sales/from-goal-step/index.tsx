import React from 'react';
import { View, Text } from 'react-native';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import Colors from '@/constants/Colors';
import { Container } from '@/components/ui/Container';

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
  return (
    <Container variant="secondaryPage" className="px-3">
      <Text className="text-base font-regular mb-2" style={{ color: Colors.primary[500] }}>¿De <Text className="font-semibold">dónde</Text> quieres retirar dinero?</Text>
      <Select options={mockGoals} value={goal} onSelect={setGoal} placeholder="Selecciona una meta" />
      {goal && (
        <>
          <Text className="text-base font-regular mb-2" style={{ color: Colors.primary[500] }}>¿A <Text className="font-semibold">dónde</Text> quieres destinarlo?</Text>
          <Select options={mockDestinos} value={destino} onSelect={setDestino} placeholder="Selecciona destino" />
        </>
      )}
    </Container>
  );
} 