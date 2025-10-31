import React, { useState, useMemo, useEffect } from 'react';
import { View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import FormLayout from '@/components/ui/FormLayout';
import { Input, Select } from '@/components/ui';
import CalendarSelect from '@/components/ui/CalendarSelect';
import { useFloidAccounts } from '@/hooks/budget/useFloidAccounts';
import { patchFloidTransaction } from '@/services/budget/patch-floid-transaction';
import { useAuth } from '@/providers/AuthProvider';

export default function EditTransactionScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const params = useLocalSearchParams();

  const transactionId = params.id as string;
  const initialDescription = params.description as string;
  const initialAmount = params.amount as string;
  const initialDate = params.date as string;
  const initialBank = params.bank as string;
  const initialAccountNumber = params.accountNumber as string;
  const transactionType = params.transactionType as 'income' | 'outcome';

  const [description, setDescription] = useState(initialDescription || '');
  const [amount, setAmount] = useState(() => {
    if (!initialAmount) return '';
    const numAmount = parseFloat(initialAmount);
    return `$${numAmount.toLocaleString('es-CL')}`;
  });
  const [date, setDate] = useState(() => {
    if (!initialDate) return '';
    const dateStr = initialDate.split('T')[0];
    const parts = dateStr.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);

    if (!description.trim()) {
      setError(t('budget.transaction_description') + ' es requerida');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError(t('budget.transaction_amount') + ' debe ser mayor a 0');
      return;
    }

    try {
      setIsLoading(true);

      const dateParts = date.split('/');
      const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

      const cleanAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.'));

      const transactionData = {
        description: description.trim(),
        amount_in: transactionType === 'income' ? cleanAmount : undefined,
        amount_out: transactionType === 'outcome' ? cleanAmount : undefined,
        date: formattedDate
      };

      await patchFloidTransaction({
        transactionId,
        transaction: transactionData
      }, accessToken!);

      setIsSaved(true);

      setTimeout(() => {
        router.back();
      }, 1000);

    } catch (err) {
      console.error('Error updating transaction:', err);
      setError(err instanceof Error ? err.message : t('budget.error_saving_transaction'));
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const isFormValid = () => {
    if (!description.trim() || !amount) {
      return false;
    }
    // Limpiar el monto para validar (remover $ y separadores)
    const cleanAmount = parseFloat(amount.replace(/[^\d]/g, ''));
    return cleanAmount > 0;
  };

  return (
    <FormLayout
      title={transactionType === 'income'
        ? t('budget.edit_transaction_income')
        : t('budget.edit_transaction_expense')
      }
      subtitle=""
      currentStep={1}
      totalSteps={1}
      onNext={handleSubmit}
      onCancel={handleCancel}
      nextButtonTitle={t('budget.update_transaction')}
      cancelButtonTitle={t('budget.cancel')}
      isLoading={isLoading}
      isSaved={isSaved}
      isNextDisabled={!isFormValid}
      error={error}
      showLogo={false}
      loadingText={t('budget.updating_transaction')}
      savedText={t('budget.transaction_updated')}
    >
      <View style={{ gap: 20 }}>
        <Input
          label={t('budget.transaction_bank')}
          value={`${initialBank} - ${initialAccountNumber}`}
          onChangeText={() => {}}
          disabled={true}
        />

        <Input
          label={t('budget.transaction_description')}
          value={description}
          onChangeText={setDescription}
          placeholder={t('budget.transaction_name')}
        />

        <Input
          label={t('budget.transaction_amount')}
          value={amount}
          onChangeText={(text) => {
            const numbers = text.replace(/[^\d]/g, '');
            if (numbers === '') {
              setAmount('');
              return;
            }
            const formatted = `$${parseInt(numbers).toLocaleString('es-CL')}`;
            setAmount(formatted);
          }}
          placeholder="$0"
          keyboardType="numeric"
        />

        <CalendarSelect
          label={t('budget.transaction_date')}
          value={date}
          onSelect={setDate}
          placeholder="DD/MM/YYYY"
        />
      </View>
    </FormLayout>
  );
}
