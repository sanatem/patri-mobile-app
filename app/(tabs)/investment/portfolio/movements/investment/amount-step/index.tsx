import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import Colors from '@/constants/Colors';

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
      <Container variant="secondaryPage">
      <View className="flex-1 justify-center items-center px-3">
        <Text className="text-base font-medium mb-2" style={{ color: Colors.primary[700] }}>Pesos chilenos</Text>
        <TextInput
          style={styles.amountInput}
          keyboardType="number-pad"
          placeholder="$0"
          placeholderTextColor={Colors.gray[500]}
          value={amount}
          onChangeText={handleAmountChange}
        />
        <Text className="text-sm font-regular mt-1" style={{ color: Colors.primary[500] }}>(a $946 el dólar)</Text>
      </View>
      <View className="px-3 mb-4 mt-4">
        <Button
          title="Finalizar"
          disabled={!amount}
          onPress={onFinish}
          variant="primary"
        />
      </View>
      </Container>
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