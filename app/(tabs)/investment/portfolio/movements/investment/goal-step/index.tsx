import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Info } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';

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
    { label: 'Reserva', value: 'Reserva', icon: <Text>🏦</Text> },
    { label: 'Casa', value: 'Casa', icon: <Text>🏠</Text> },
    { label: 'Mejorar mi jubilación', value: 'Mejorar mi jubilación', icon: <Text>💰</Text> },
  ];

  const handleGoalSelect = (goal: string) => {
    console.log('Selecting goal:', goal);
    setSelectedGoal(goal);
    if (onGoalSelect) {
      onGoalSelect(goal);
    }
  };

  const handleContinue = () => {
    console.log('Continue pressed with goal:', selectedGoal);
    if (onContinue) {
      onContinue();
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView 
        className="flex-1 px-5" 
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-base font-semibold text-gray-900 mb-6">
          ¿A qué meta quieres mover tu dinero?
        </Text>

        <Select
          options={goalOptions}
          value={selectedGoal}
          onSelect={handleGoalSelect}
          placeholder="Selecciona una meta"
          className="mb-4"
        />
      </ScrollView>

      {/* Footer */}
      <View className="bg-gray-50 border-t border-gray-200 p-5">
        <View className="flex-row items-center mb-3" style={{ gap: 4 }}>
          <Text className="text-sm text-gray-500">No aplica para objetivos APV</Text>
          <Info size={16} color="#6B7280" />
        </View>

        <Button
          title="Continuar"
          variant="primary"
          onPress={handleContinue}
          fullWidth
          disabled={!selectedGoal}
        />
      </View>
    </View>
  );
} 