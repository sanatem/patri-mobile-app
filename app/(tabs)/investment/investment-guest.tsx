import { router } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

export default function InvestmentGuest() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Invierte en Acciones o ETF</Text>
      <Text style={styles.subtitle}>La forma más fácil de invertir en la bolsa de Estados Unidos</Text>

      <View style={styles.infoBox}>
        <Text style={styles.item}>💸 <Text style={styles.bold}>Más de 2000 ETFs y acciones</Text> disponibles para comprar</Text>
        <Text style={styles.item}>🕒 <Text style={styles.bold}>Al instante:</Text> invierte en segundos cuando el mercado está abierto</Text>
        <Text style={styles.item}>🧾 <Text style={styles.bold}>Te ayudamos con tu declaración</Text> de tus acciones en el SII</Text>
      </View>

      <TouchableOpacity
  style={styles.button}
  onPress={() => router.push('/investment/portfolio/portfolio' as any)}
>
  <Text style={styles.buttonText}>Comenzar</Text>
</TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        backgroundColor: '#F9FAFB',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 40,
      },
      
  icon: { width: 60, height: 60, marginTop: 40, marginBottom: 24 },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', color: '#111', marginTop: 48 },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#6B7280', marginBottom: 32 },
  infoBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 32
  },
  item: { fontSize: 15, color: '#111', marginBottom: 12 },
  bold: { fontWeight: '700' },
  button: {
    backgroundColor: '#FF5603',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center'
  }
});
