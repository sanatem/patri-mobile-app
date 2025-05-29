import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  LineChart,
  PiggyBank,
  Home,
  ShieldCheck,
  DollarSign,
  BarChart,
  TrendingUp,
  Plus,
  Settings,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function InvestmentPortfolioScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header principal */}
      <View style={styles.mainHeader}>
        <Text style={styles.headerTitle}>Portfolio</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => router.push('/settings')}
        >
          <Settings size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Header de patrimonio */}
      <View style={styles.balanceHeader}>
        <Text style={styles.balanceLabel}>
          Tu patrimonio <Text style={styles.infoIcon}>ⓘ</Text>
        </Text>
        <Text style={styles.balanceValue}>$59.809</Text>

        <View style={styles.balanceActions}>
        <TouchableOpacity
  style={styles.roundButton}
  onPress={() => router.push('/(tabs)/investment/investment-step')}
>
  <TrendingUp size={24} color="white" />
  <Text style={styles.roundLabel}>Invertir</Text>
</TouchableOpacity>
<TouchableOpacity
  style={styles.roundButton}
  onPress={() => router.push('/(tabs)/investment/create-goals')}
>
  <Plus size={24} color="white" />
  <Text style={styles.roundLabel}>Crear</Text>
</TouchableOpacity>

        </View>
      </View>

      {/* Inversiones */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Inversiones</Text>
        <TouchableOpacity>
          <Text style={styles.link}>
            Ver resumen <Text style={styles.dot}>•</Text>
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardList}>
        {[
          {
            title: 'Reserva',
            subtitle: '',
            amount: '$0',
            icon: <PiggyBank size={24} color="#ff5630" />,
          },
          {
            title: 'Emergencias',
            subtitle: 'Corto plazo',
            amount: '$59.809',
            icon: <LineChart size={24} color="#ff5630" />,
            onPress: () =>
                router.push({
                  pathname: '/(tabs)/investment/portfolio-details',
                  params: {
                    title: 'Emergencias',
                    subtitle: 'Corto plazo',
                    amount: '$59.809',
                  },
                }),
              
          },
          {
            title: 'Casa',
            subtitle: 'Largo plazo',
            amount: '$0',
            icon: <Home size={24} color="#ff5630" />,
          },
          {
            title: 'Mejorar mi jubilación',
            subtitle: 'Jubilación con APV-B',
            amount: '$0',
            icon: <ShieldCheck size={24} color="#ff5630" />,
          },
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={item.onPress}
          >
            <View style={styles.cardContent}>
              <View style={styles.iconWrapper}>{item.icon}</View>

              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                {item.subtitle !== '' && (
                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                )}
              </View>
              <Text style={styles.cardAmount}>{item.amount}</Text>
              <Text style={styles.arrow}>{'>'}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Acciones */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Acciones</Text>
        <TouchableOpacity>
          <Text style={styles.link}>Ver portafolio</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardList}>
        {[
          {
            title: 'Dólares',
            subtitle: 'Compra para invertir o ahorrar',
            icon: <DollarSign size={24} color="#ff5630" />,
          },
          {
            title: 'Acciones',
            subtitle: 'Invierte desde US $1',
            icon: <BarChart size={24} color="#ff5630" />,
          },
        ].map((item, index) => (
          <TouchableOpacity key={index} style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.iconWrapper}>{item.icon}</View>

              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.arrow}>{'>'}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 20,
    paddingBottom: 40,
    marginTop: 64,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  link: {
    color: '#ff5630',
    fontWeight: '600',
    fontSize: 14,
  },
  dot: {
    color: '#ff5630',
    fontWeight: 'bold',
  },
  cardList: {
    marginBottom: 24,
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  cardAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginRight: 6,
  },
  arrow: {
    fontSize: 18,
    color: '#D1D5DB',
  },
  iconWrapper: {
    width: 32,
    height: 32,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  balanceLabel: {
    fontSize: 20,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoIcon: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  balanceActions: {
    flexDirection: 'row',
    gap: 16,
  },
  roundButton: {
    backgroundColor: '#FF5603',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  roundLabel: {
    fontSize: 13,
    color: 'white',
    fontWeight: '600',
    marginTop: 4,
  },
  mainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
