import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function PhoneStep() {
  const [phone, setPhone] = useState('');
  const canContinue = phone.length >= 9;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¿Cuál es tu número de teléfono?</Text>
      <Text style={styles.subtitle}>Lo pedimos por razones regulatorias</Text>

      <TextInput
        placeholder="9 1234 5678"
        keyboardType="phone-pad"
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
      />

      <TouchableOpacity
        style={[styles.button, !canContinue && styles.buttonDisabled]}
        onPress={() => router.push('/investment/create-account/personal-information/income-source' as any)}
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
    textAlign: 'center',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16
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
