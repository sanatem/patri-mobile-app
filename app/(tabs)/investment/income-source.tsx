import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

const options = [
  'Sueldo/Honorarios',
  'Inversiones',
  'Ingresos de negocio',
  'Bienes raíces',
  'Herencia',
  'Ahorros'
];

export default function IncomeSourceStep() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¿De dónde proviene el dinero que quieres invertir?</Text>

      {options.map((option, idx) => (
        <TouchableOpacity
          key={idx}
          style={[styles.option, selected === option && styles.optionSelected]}
          onPress={() => setSelected(option)}
        >
          <View style={styles.optionContent}>
  <View style={[styles.radioOuter, selected === option && styles.radioOuterSelected]}>
    {selected === option && <View style={styles.radioInner} />}
  </View>
  <Text style={styles.optionLabel}>{option}</Text>
</View>

        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[styles.button, !selected && styles.buttonDisabled]}
        onPress={() => selected && router.push('/(tabs)/investment/occupation')}
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
    backgroundColor: '#fff',
    paddingTop: 80
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20
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
  optionText: {
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
  }
  
});
