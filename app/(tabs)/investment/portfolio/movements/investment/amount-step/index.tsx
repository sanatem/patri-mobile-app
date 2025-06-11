import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';

interface AmountStepProps {
  amount: string;
  onAmountChange: (amount: string) => void;
  onFinish: () => void;
}

export default function AmountStep({
  amount,
  onAmountChange,
  onFinish,
}: AmountStepProps) {
  const handleAmountChange = (text: string) => {
    const clean = text.replace(/[^\d]/g, '');
    onAmountChange(clean);
  };

  return (
    <>
      {/* Monto */}
      <View style={styles.amountBox}>
        <Text style={styles.label}>Pesos chilenos</Text>
        <TextInput
          style={styles.amountInput}
          keyboardType="number-pad"
          placeholder="$0"
          placeholderTextColor="#9CA3AF"
          value={amount}
          onChangeText={handleAmountChange}
        />
        <Text style={styles.rateText}>(a $946 el dólar)</Text>
      </View>

      {/* Botón finalizar */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.primaryBtn,
            amount ? styles.btnEnabled : styles.btnDisabled,
          ]}
          disabled={!amount}
          onPress={onFinish}
        >
          <Text
            style={[
              styles.primaryText,
              amount ? styles.textEnabled : styles.textDisabled,
            ]}
          >
            Finalizar
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
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
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
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
  btnEnabled: {
    backgroundColor: '#FF5603',
  },
  btnDisabled: {
    backgroundColor: '#E5E7EB',
  },
  textEnabled: {
    color: '#fff',
  },
  textDisabled: {
    color: '#9CA3AF',
  },
});