import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function PEP() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¿Eres una persona expuesta políticamente (PEP)?</Text>

      <TouchableOpacity style={styles.option} onPress={() => router.push('/investment/create-account/personal-information/address' as any)}>
        <Text style={styles.optionText}>Sí</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={() => router.push('/investment/create-account/personal-information/address' as any)}>
        <Text style={styles.optionText}>No</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#111827',
  },
  option: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  optionText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#1f2937',
  },
});
