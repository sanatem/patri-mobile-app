import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, X } from 'lucide-react-native';

export default function EnterAmountScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('');

  const handleChange = (text: string) => {
    const clean = text.replace(/[^\d]/g, '');
    setAmount(clean);
  };

  const handleFinish = () => {
    Keyboard.dismiss();
    router.push('/investment/portfolio/portfolio' as any);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color="#FF5603" />
        </TouchableOpacity>
        <Text style={styles.title}>Ingresar monto</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={22} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Monto */}
      <View style={styles.amountBox}>
        <Text style={styles.label}>Pesos chilenos</Text>
        <TextInput
          style={styles.amountInput}
          keyboardType="number-pad"
          placeholder="$0"
          placeholderTextColor="#9CA3AF"
          value={amount}
          onChangeText={handleChange}
        />
        <Text style={styles.rateText}>(a $946 el dólar)</Text>
      </View>

      {/* Botón finalizar */}
      <View style={styles.bottom}>
        <TouchableOpacity
          style={[
            styles.continueBtn,
            amount ? styles.btnEnabled : styles.btnDisabled,
          ]}
          disabled={!amount}
          onPress={handleFinish}
        >
          <Text
            style={[
              styles.continueText,
              amount ? styles.textEnabled : styles.textDisabled,
            ]}
          >
            Finalizar
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', paddingTop: 64 },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  amountBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  amountInput: {
    fontSize: 40,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    width: '100%',
  },
  rateText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 8,
  },
  bottom: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  continueBtn: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnEnabled: {
    backgroundColor: '#FF5603',
  },
  btnDisabled: {
    backgroundColor: '#E5E7EB',
  },
  continueText: {
    fontSize: 16,
    fontWeight: '600',
  },
  textEnabled: {
    color: '#fff',
  },
  textDisabled: {
    color: '#9CA3AF',
  },
});
