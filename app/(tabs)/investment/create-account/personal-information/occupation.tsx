import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function OccupationStep() {
  const [employment, setEmployment] = useState('');
  const [occupation, setOccupation] = useState('');
  const canContinue = employment && occupation;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¿A qué te dedicas?</Text>
      <TextInput
        placeholder="Situación laboral"
        style={styles.input}
        value={employment}
        onChangeText={setEmployment}
      />
      <TextInput
        placeholder="Ocupación o profesión"
        style={styles.input}
        value={occupation}
        onChangeText={setOccupation}
      />

      <TouchableOpacity
        style={[styles.button, !canContinue && styles.buttonDisabled]}
        onPress={() => router.push('/investment/create-account/personal-information/monthly-income' as any)}
        disabled={!canContinue}
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
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12
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
