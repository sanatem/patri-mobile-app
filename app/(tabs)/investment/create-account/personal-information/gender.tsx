import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function Gender() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¿Cómo nos dirigimos a ti?</Text>

      <TouchableOpacity style={styles.option} onPress={() => router.push('/investment/create-account/personal-information/nationality' as any)}>
        <Text style={styles.optionText}>En femenino</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={() => router.push('/investment/create-account/personal-information/nationality' as any)}>
        <Text style={styles.optionText}>En masculino</Text>
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
