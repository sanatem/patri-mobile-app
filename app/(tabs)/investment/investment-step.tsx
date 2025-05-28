import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { ChevronLeft, Info, ChevronDown } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function InvestmentStep() {
  const router = useRouter();
  const { from = 'Emergencias' } = useLocalSearchParams();
  const [selected, setSelected] = useState('Reserva');
  const [open, setOpen] = useState(false);

  const options = ['Reserva', 'Casa', 'Mejorar mi jubilación'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color="#FF5603" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Mover desde 🚒 {from}
        </Text>
        <View style={{ width: 24 }} /> {/* Espacio para simetría */}
      </View>

      {/* Body */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.question}>¿A qué objetivo quieres mover tu dinero?</Text>

        {/* Dropdown fake */}
        <Pressable
          style={styles.selectBox}
          onPress={() => setOpen((prev) => !prev)}
        >
          <Text style={styles.selectLabel}>Selecciona un objetivo</Text>
          <View style={styles.selectContent}>
            <Text style={styles.selectedValue}>🏠 {selected}</Text>
            <ChevronDown size={18} color="#6B7280" />
          </View>
        </Pressable>

        {/* Opciones (visibles si open) */}
        {open && (
          <View style={styles.dropdown}>
            {options.map((opt) => (
              <Pressable
                key={opt}
                style={styles.option}
                onPress={() => {
                  setSelected(opt);
                  setOpen(false);
                }}
              >
                <Text style={styles.optionText}>{opt}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>No aplica para objetivos APV</Text>
          <Info size={16} color="#6B7280" />
        </View>

        <TouchableOpacity
  style={styles.primaryBtn}
  onPress={() => router.push('/(tabs)/investment/enter-amount')}
>
  <Text style={styles.primaryText}>Continuar</Text>
</TouchableOpacity>

      </View>
    </View>
  );
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: {
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#111827',
      flex: 1,
      textAlign: 'center',
    },
    content: {
      padding: 20,
    },
    question: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 12,
      color: '#111827',
    },
    selectBox: {
      backgroundColor: '#F1F5F9',
      borderRadius: 8,
      padding: 12,
    },
    selectLabel: {
      fontSize: 12,
      color: '#6B7280',
      marginBottom: 4,
    },
    selectContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    selectedValue: {
      fontSize: 16,
      fontWeight: '600',
      color: '#111827',
    },
    dropdown: {
      backgroundColor: '#fff',
      borderRadius: 8,
      marginTop: 8,
      padding: 8,
      borderColor: '#E5E7EB',
      borderWidth: 1,
    },
    option: {
      paddingVertical: 8,
    },
    optionText: {
      fontSize: 15,
      color: '#111827',
    },
    footer: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
      backgroundColor: '#F9FAFB',
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 4,
    },
    infoText: {
      fontSize: 13,
      color: '#6B7280',
    },
    primaryBtn: {
      backgroundColor: '#FF5603',
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
    },
    primaryText: {
      fontSize: 16,
      color: '#fff',
      fontWeight: '600',
    },
  });
  