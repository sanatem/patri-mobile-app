import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

const ranges = [
  'Menos de $500.000',
  'Entre $500.000 y $1.000.000',
  'Entre $1.000.000 y $2.000.000',
  'Más de $2.000.000'
];

export default function MonthlyIncomeStep() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¿Cuál es tu ingreso mensual?</Text>
      <Text style={styles.subtitle}>Una estimación está bien</Text>

      {ranges.map((range, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.option, selected === range && styles.optionSelected]}
          onPress={() => setSelected(range)}
        >
          <View style={styles.optionContent}>
            <View style={[styles.radioOuter, selected === range && styles.radioOuterSelected]}>
              {selected === range && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.optionLabel}>{range}</Text>
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[styles.button, !selected && styles.buttonDisabled]}
        onPress={() => selected && router.push('/(tabs)/investment/summary')}
        disabled={!selected}
      >
        <Text style={styles.buttonText}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16
  },
  option: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12
  },
  optionSelected: {
    borderColor: '#ff5603',
    backgroundColor: 'white'
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center'
  },
  radioOuterSelected: {
    borderColor: '#ff5603'
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff5603'
  },
  optionLabel: {
    fontSize: 16
  },
  button: {
    backgroundColor: '#ff5603',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonDisabled: {
    backgroundColor: '#d1d5db'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600'
  }
});
