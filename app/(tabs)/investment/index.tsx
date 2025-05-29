import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useRouter } from 'expo-router';
import { DollarSign, Settings } from 'lucide-react-native';

export default function InvestmentIndex() {
  const routerHook = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inversiones</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => routerHook.push('/settings')}
        >
          <Settings size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <DollarSign size={32} color="#ff5603" />
        </View>

        <Text style={styles.title}>Un solo lugar para hacer crecer tu patrimonio.</Text>
        <Text style={styles.subtitle}>
          Opciones de ahorro e inversión personalizadas, para todo tipo de inversionista.
        </Text>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/investment/create-account/investment-survey/start-profile' as any)}
        >
          <Text style={styles.buttonText}>Comenzar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/investment/investment-guest' as any)}>
          <Text style={{ color: "#FF5603", textAlign: "center", marginTop: 16 }}>
            Continuar sin cuenta
          </Text>
        </TouchableOpacity>
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827'
  },
  settingsButton: {
    padding: 8
  },
  content: {
    flex: 1,
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
