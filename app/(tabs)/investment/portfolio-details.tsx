import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Svg, { Path, Line } from 'react-native-svg';
import { ArrowRight, ChevronLeft } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const chartHeight = 240;

export default function PortfolioDetailsScreen() {
  const router = useRouter();
  const { title = '', subtitle = '', amount = '' } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
  <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
    <ChevronLeft size={24} color="#FF5603" />
  </TouchableOpacity>
  <Text style={styles.title}>{title}</Text>
</View>



        {/* Rentabilidad */}
        <View style={styles.tipBox}>
          <Text style={styles.tipText}>
            <ArrowRight size={13} color="#FF5603" /> En 28 meses tu inversión ha rentado un 19,55%
          </Text>
        </View>

        {/* Balance */}
        <Text style={styles.label}>Balance</Text>
        <Text style={styles.balance}>{amount}</Text>

        <View style={styles.row}>
          <Text style={styles.sub}>Depositaste</Text>
          <Text style={styles.sub}>Variación</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.value}>$50.017</Text>
          <Text style={styles.value}>$9.792</Text>
        </View>

        {/* Gráfico */}
        <View style={styles.chartBox}>
          <Svg
            width="100%"
            height="100%"
            viewBox="0 0 300 240"
            preserveAspectRatio="none"
          >
            <Line x1="0" y1="200" x2="300" y2="200" stroke="#E5E7EB" strokeWidth="1" />
            <Path
              d="M 0 200 L 50 180 L 100 160 L 150 130 L 200 100 L 250 60 L 300 40 L 300 200 Z"
              fill="rgba(255, 86, 3, 0.1)"
            />
            <Path
              d="M 0 200 L 50 180 L 100 160 L 150 130 L 200 100 L 250 60 L 300 40"
              stroke="#FF5603"
              strokeWidth="3"
              fill="none"
              strokeLinejoin="round"
            />
          </Svg>
        </View>

        <Text style={styles.updated}>Actualizado al cierre del martes 27 de mayo</Text>

        {/* Detalle inversión */}
        <Text style={styles.section}>Cómo está invertida</Text>

        <View style={styles.itemBox}>
          <Text style={styles.itemLabel}>Nivel de riesgo</Text>
          <Text style={styles.itemValue}>Muy conservador</Text>
        </View>

        <View style={styles.itemBox}>
          <Text style={styles.itemLabel}>Plazo de inversión</Text>
          <Text style={styles.itemValue}>6 meses</Text>
          <Text style={styles.subText}>Llevas 28 meses</Text>
        </View>

        <View style={styles.itemBox}>
          <Text style={styles.itemValue}>Very Conservative Streep A</Text>
          <Text style={styles.itemValue}>{amount}</Text>
          <Text style={styles.subText}>100,00%</Text>
        </View>

        {/* Actividad */}
        <Text style={styles.section}>Actividad</Text>

        <View style={styles.actionBox}>
          <TouchableOpacity>
            <Text style={styles.move}>Mover</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.itemBox}>
          <Text style={styles.itemLabel}>Movimientos</Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.secondaryBtn}>
          <Text style={styles.secondaryText}>Retirar</Text>
        </TouchableOpacity>
        <TouchableOpacity
  style={styles.primaryBtn}
  onPress={() =>
    router.push({
      pathname: '/(tabs)/investment/investment-step',
      params: {
        from: title, // o cualquier identificador que quieras
      },
    })
  }
>
  <Text style={styles.primaryText}>Invertir</Text>
</TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { padding: 20, paddingBottom: 120 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  
  backButton: {
    paddingRight: 8,
  },
  
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  
  spacer: { width: 24 },
  tipBox: {
    backgroundColor: 'rgba(255, 86, 3, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  tipText: { fontSize: 14 },
  label: { color: '#6B7280', fontSize: 14 },
  balance: { fontSize: 28, fontWeight: '700', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  sub: { fontSize: 13, color: '#6B7280' },
  value: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  chartBox: {
    width: '100%',
    height: chartHeight,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginVertical: 16,
    overflow: 'hidden',
  },
  updated: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 12,
  },
  itemBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  itemLabel: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  itemValue: { fontSize: 15, fontWeight: '600' },
  subText: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  actionBox: {
    backgroundColor: 'rgba(255, 86, 3, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  move: {
    color: '#FF5603',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#F9FAFB',
    justifyContent: 'space-between',
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    paddingVertical: 14,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  secondaryText: { fontWeight: '600' },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#FF5603',
    paddingVertical: 14,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  primaryText: { color: '#fff', fontWeight: '600' },
});
