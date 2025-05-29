import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function SummaryStep() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Tu perfil está casi listo!</Text>
      <Text style={styles.subtitle}>Estamos validando tu información. Una vez listo, podrás comenzar a invertir 🚀</Text>

      <View style={styles.stepBox}>
        <Text style={styles.stepTitle}>✔️ Verificación de identidad</Text>
        <Text style={styles.stepDetail}>Documento recibido y en revisión</Text>
      </View>

      <View style={styles.stepBox}>
        <Text style={styles.stepTitle}>✔️ Información básica</Text>
        <Text style={styles.stepDetail}>Tus datos fueron registrados correctamente</Text>
      </View>

      <View style={styles.stepBox}>
        <Text style={styles.stepTitle}>⏳ Contrato y validación de correo</Text>
        <Text style={styles.stepDetail}>Firmarás una vez que terminemos de verificar tu información</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(tabs)/investment')}
      >
        <Text style={styles.buttonText}>Volver al inicio</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center'
  },
  title: {
    fontSize: 22,
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
  stepBox: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12
  },
  stepTitle: {
    fontWeight: '600',
    marginBottom: 4
  },
  stepDetail: {
    color: '#6b7280'
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
