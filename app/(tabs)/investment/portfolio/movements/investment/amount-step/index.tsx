import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import Colors from '@/constants/Colors';
import { useFormatValue } from '@/hooks/common/useFormatValue';
import { useTranslation } from 'react-i18next';

interface AmountStepProps {
  amount: string;
  onAmountChange: (amount: string) => void;
  onFinish: () => void;
}

export default function AmountStep({
  amount = '',
  onAmountChange = () => {},
  onFinish = () => {},
}: AmountStepProps) {
    const { formatValue, cleanNumericValue } = useFormatValue();
    const { t } = useTranslation();
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (amount) {
      setDisplayValue(formatValue(amount));
    } else {
      setDisplayValue('');
    }
  }, [amount, formatValue]);

  const handleAmountChange = (text: string) => {
    const clean = cleanNumericValue(text);
    
    if (clean) {
      setDisplayValue(formatValue(clean));
      if (typeof onAmountChange === 'function') {
        onAmountChange(clean);
      }
    } else {
      setDisplayValue('');
      if (typeof onAmountChange === 'function') {
        onAmountChange('');
      }
    }
  };

  return (
    <>
      <Container variant="secondaryPage">
      <View className="flex-1 justify-center items-center px-3">
        <Text className="text-base font-medium mb-2" style={{ color: Colors.primary[700] }}>{t('amountStep.title')}</Text>
        <TextInput
          style={styles.amountInput}
          keyboardType="number-pad"
          placeholder={t('amountStep.placeholder')}
          placeholderTextColor={Colors.gray[500]}
          value={displayValue}
          onChangeText={handleAmountChange}
        />
        <Text className="text-sm font-regular mt-1" style={{ color: Colors.primary[500] }}>{t('amountStep.rateNote', { rate: 946 })}</Text>
      </View>
      <View className="px-3 mb-4 mt-4">
        <Button
          title={t('common.finish')} 
          disabled={!amount}
          onPress={() => typeof onFinish === 'function' && onFinish()}
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
    borderTopColor: Colors.gray[100],
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
    backgroundColor: Colors.gray[100],
  },
  textEnabled: {
    color: '#fff',
  },
  textDisabled: {
    color: '#9CA3AF',
  },
});