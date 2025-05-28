// app/(tabs)/investment/identity-confirm.tsx
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function IdentityConfirm() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirma tus datos</Text>
      <Text style={styles.subtitle}>Edítalos si encuentras un error o faltó alguno.</Text>

      <TextInput style={styles.input} placeholder="Nombres" value="Rommina Paz" />
      <TextInput style={styles.input} placeholder="Primer apellido" value="Cáceres" />
      <TextInput style={styles.input} placeholder="Segundo apellido" value="Pinilla" />
      <TextInput style={styles.input} placeholder="Sexo" value="Femenino" />
      <TextInput style={styles.input} placeholder="Fecha de nacimiento" value="18-01-1995" />
      <TextInput style={styles.input} placeholder="Fecha vencimiento carnet" value="18-01-2035" />

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(tabs)/investment/gender')}
      >
        <Text style={styles.buttonText}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, padding: 24, backgroundColor: '#fff', paddingTop: 80
  },
  title: {
    fontSize: 20, fontWeight: '700', marginBottom: 4
  },
  subtitle: {
    color: '#6b7280', marginBottom: 16
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
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600'
  }
});
