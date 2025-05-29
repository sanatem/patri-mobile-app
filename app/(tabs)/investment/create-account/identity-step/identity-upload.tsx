// app/(tabs)/investment/identity-upload.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function IdentityUpload() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sube tu carnet</Text>
      <Text style={styles.subtitle}>
        Haz click en el recuadro para subir la foto o arrástrala directamente
      </Text>

      <TouchableOpacity style={styles.uploadBox} onPress={() => router.push('/investment/create-account/identity-step/identity-confirm' as any)}>
        <Text style={styles.uploadText}>+ Subir foto del carnet</Text>
      </TouchableOpacity>

      <Text style={styles.link}>¿Qué datos obtendrán de mi carnet?</Text>

      <TouchableOpacity style={styles.buttonDisabled} disabled>
        <Text style={styles.buttonDisabledText}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, padding: 24, backgroundColor: '#fff', paddingTop: 80
  },
  title: {
    fontSize: 20, fontWeight: '700', marginBottom: 8
  },
  subtitle: {
    color: '#6b7280', marginBottom: 24
  },
  uploadBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ff5603',
    borderRadius: 12,
    padding: 36,
    alignItems: 'center',
    marginBottom: 20
  },
  uploadText: {
    color: '#ff5603',
    fontSize: 16,
    fontWeight: '500'
  },
  link: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24
  },
  buttonDisabled: {
    backgroundColor: '#d1d5db',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center'
  },
  buttonDisabledText: {
    color: '#fff',
    fontWeight: '600'
  }
});
