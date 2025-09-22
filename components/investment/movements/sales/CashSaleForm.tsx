import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useFormatValue } from '@/hooks/common/useFormatValue';

interface CashSaleFormProps {
  amount: string;
  setAmount: (value: string) => void;
  bankAccount: string | undefined;
  setBankAccount: (value: string) => void;
  bankAccounts: { label: string; value: string }[];
}

export default function CashSaleForm({
  amount,
  setAmount,
  bankAccount,
  setBankAccount,
  bankAccounts
}: CashSaleFormProps) {
  const { t } = useTranslation();
  const { formatValue, cleanNumericValue } = useFormatValue();

  const handleAmountChange = (value: string) => {
    const cleaned = cleanNumericValue(value);
    setAmount(cleaned);
  };

  return (
    <View>
      <Input
        label={t('salesFlow.cashSale.amountLabel')}
        value={amount ? formatValue(amount) : ''}
        onChangeText={handleAmountChange}
        placeholder="$0"
        keyboardType="numeric"
        className="mb-4"
      />

      <Select
        label={t('salesFlow.cashSale.bankAccountLabel')}
        options={bankAccounts}
        value={bankAccount}
        onSelect={setBankAccount}
        placeholder={t('salesFlow.cashSale.bankAccountPlaceholder')}
      />
    </View>
  );
}