import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function ProfileResult() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🕵️‍♀️</Text>
      <Text style={styles.title}>Tu perfil es conservador</Text>
      <Text style={styles.subtitle}>
        Valorás principalmente la estabilidad, pero tolerás un poco de riesgo en tus inversiones.
      </Text>
      <Text style={styles.subtitle}>Puedes cambiarlo más adelante si lo deseas.</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(tabs)/investment/complete-profile')}
      >
        <Text style={styles.buttonText}>Entendido, continuemos</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff'
  },
  emoji: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8
  },
  button: {
    backgroundColor: '#ff5603',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600'
  }
});
