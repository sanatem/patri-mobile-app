// app/(tabs)/investment/identity-method.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function IdentityMethod() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>¿Con qué documento te verificarás?</Text>
      <Text style={styles.subtitle}>
        Necesitamos un documento emitido en Chile, vigente y que pertenezca a un mayor de edad
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(tabs)/investment/identity-upload')}
      >
        <Text style={styles.buttonText}>Con carnet de identidad</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(tabs)/investment/identity-upload')}
      >
        <Text style={styles.buttonText}>Con pasaporte chileno</Text>
      </TouchableOpacity>

      <Text style={styles.link}>¿Por qué necesitan un documento?</Text>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, padding: 24, backgroundColor: '#fff', paddingTop: 80
  },
  title: {
    fontSize: 20, fontWeight: '700', marginBottom: 12
  },
  subtitle: {
    fontSize: 15, color: '#6b7280', marginBottom: 24
  },
  button: {
    backgroundColor: '#f9fafb', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#d1d5db'
  },
  buttonText: {
    fontSize: 16, fontWeight: '500', textAlign: 'center'
  },
  link: {
    marginTop: 20,
    color: '#ff5603',
    fontSize: 14,
    textAlign: 'center'
  }
});
