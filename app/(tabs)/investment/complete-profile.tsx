// app/(tabs)/investment/complete-profile.tsx

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function CompleteProfile() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Completa tu perfil</Text>

      <TouchableOpacity
        style={styles.stepActive}
        onPress={() => router.push('/(tabs)/investment/identity-method')}
      >
        <Text style={styles.stepTitle}>Verificación de identidad</Text>
        <Text style={styles.stepSubtitle}>Sube un documento de identidad</Text>
      </TouchableOpacity>

      <View style={styles.stepDisabled}>
        <Text style={styles.stepTitleDisabled}>Información básica</Text>
        <Text style={styles.stepSubtitleDisabled}>Compártenos un poco sobre ti</Text>
      </View>

      <View style={styles.stepDisabled}>
        <Text style={styles.stepTitleDisabled}>Contrato y validación correo</Text>
        <Text style={styles.stepSubtitleDisabled}>Firma tu contrato y verifica tu cuenta</Text>
      </View>

      <View style={styles.stepDisabled}>
        <Text style={styles.stepTitleDisabled}>Comenzar a invertir</Text>
        <Text style={styles.stepSubtitleDisabled}>Elige qué quieres hacer con tu plata</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 24
  },
  stepActive: {
    backgroundColor: '#ff5603',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16
  },
  stepTitle: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  },
  stepSubtitle: {
    color: '#fff',
    marginTop: 4
  },
  stepDisabled: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16
  },
  stepTitleDisabled: {
    fontWeight: '600',
    color: '#9ca3af',
    fontSize: 16
  },
  stepSubtitleDisabled: {
    color: '#9ca3af',
    marginTop: 4
  }
});
