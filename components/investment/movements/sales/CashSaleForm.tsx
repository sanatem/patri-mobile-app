import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

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

  return (
    <View>
      <Input
        label={t('salesFlow.cashSale.amountLabel')}
        value={amount}
        onChangeText={setAmount}
        placeholder="0"
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