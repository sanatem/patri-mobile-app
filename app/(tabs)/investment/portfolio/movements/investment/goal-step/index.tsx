import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import Colors from '@/constants/Colors';

interface GoalSelectionStepProps {
  selectedGoal?: string;
  onGoalSelect?: (goal: string) => void;
  onContinue?: () => void;
}

export default function GoalSelectionStep({
  selectedGoal: initialGoal = '',
  onGoalSelect,
  onContinue,
}: GoalSelectionStepProps) {
  const [selectedGoal, setSelectedGoal] = useState(initialGoal);

  const goalOptions = [
    { label: 'Reserva', value: 'Reserva' },
    { label: 'Casa', value: 'Casa' },
    { label: 'Mejorar mi jubilación', value: 'Mejorar mi jubilación' },
  ];

  const handleGoalSelect = (goal: string) => {
    setSelectedGoal(goal);
    if (onGoalSelect) {
      onGoalSelect(goal);
    }
  };

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    }
  };

  return (
    <Container variant="secondaryPage">
      <ScrollView 
        className="flex-1 px-3" 
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-base font-regular mb-6" style={{ color: Colors.primary[500] }}>
          ¿A qué <Text className="font-semibold">meta</Text> quieres invertir?
        </Text>

        <Select
          options={goalOptions}
          value={selectedGoal}
          onSelect={handleGoalSelect}
          placeholder="Selecciona una meta"
          className="mb-4"
        />
      </ScrollView>

      <View className="mb-4 mt-4 px-3">
        <Button
          title="Continuar"
          variant="primary"
          onPress={handleContinue}
          fullWidth
          disabled={!selectedGoal}
        />
      </View>
    </Container>
  );
} 