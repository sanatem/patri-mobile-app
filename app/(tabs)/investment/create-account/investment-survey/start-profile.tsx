import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function StartProfile() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Veamos qué tipo de inversionista eres</Text>
      <Text style={styles.subtitle}>
        Te haremos algunas preguntas para determinar tu perfil de inversionista. Puedes cambiarlo más adelante si lo necesitas.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/investment/create-account/investment-survey/profile-question' as any)}
      >
        <Text style={styles.buttonText}>Empecemos</Text>
      </TouchableOpacity>

      <Text style={styles.estimate}>⏱ aprox. 4 minutos</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  emojis: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20
  },
  emoji: {
    fontSize: 36
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 24
  },
  button: {
    backgroundColor: '#ff5603',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  },
  estimate: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 12
  }
});
