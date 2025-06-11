import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { Info, ChevronDown } from 'lucide-react-native';

interface GoalSelectionStepProps {
  selectedGoal: string;
  onGoalSelect: (goal: string) => void;
  onContinue: () => void;
  dropdownOpen: boolean;
  setDropdownOpen: (open: boolean) => void;
}

export default function GoalSelectionStep({
  selectedGoal,
  onGoalSelect,
  onContinue,
  dropdownOpen,
  setDropdownOpen,
}: GoalSelectionStepProps) {
  const goalOptions = ['Reserva', 'Casa', 'Mejorar mi jubilación'];

  const handleGoalSelect = (goal: string) => {
    onGoalSelect(goal);
    setDropdownOpen(false);
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.question}>¿A qué meta quieres mover tu dinero?</Text>

        {/* Dropdown */}
        <Pressable
          style={styles.selectBox}
          onPress={() => setDropdownOpen(!dropdownOpen)}
        >
          <Text style={styles.selectLabel}>Selecciona una meta</Text>
          <View style={styles.selectContent}>
            <Text style={styles.selectedValue}>🏠 {selectedGoal}</Text>
            <ChevronDown size={18} color="#6B7280" />
          </View>
        </Pressable>

        {/* Opciones */}
        {dropdownOpen && (
          <View style={styles.dropdown}>
            {goalOptions.map((goal) => (
              <Pressable
                key={goal}
                style={styles.option}
                onPress={() => handleGoalSelect(goal)}
              >
                <Text style={styles.optionText}>{goal}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>No aplica para objetivos APV</Text>
          <Info size={16} color="#6B7280" />
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={onContinue}>
          <Text style={styles.primaryText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#111827',
  },
  selectBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
  },
  selectLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  selectContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 8,
    padding: 8,
    borderColor: '#E5E7EB',
    borderWidth: 1,
  },
  option: {
    paddingVertical: 8,
  },
  optionText: {
    fontSize: 15,
    color: '#111827',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
  },
  primaryBtn: {
    backgroundColor: '#FF5603',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
}); 