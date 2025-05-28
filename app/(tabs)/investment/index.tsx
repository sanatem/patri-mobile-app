import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { DollarSign } from 'lucide-react-native';

export default function InvestmentIndex() {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <DollarSign size={32} color="#ff5603" />
      </View>

      <Text style={styles.title}>Un solo lugar para hacer crecer tu patrimonio.</Text>
      <Text style={styles.subtitle}>
        Opciones de ahorro e inversión personalizadas, para todo tipo de inversionista.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(tabs)/investment/start-profile')}
      >
        <Text style={styles.buttonText}>Comenzar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center'
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 86, 3, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    color: '#111827'
  },
  subtitle: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 24
  },
  button: {
    backgroundColor: '#ff5603',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 9999
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16
  }
});
