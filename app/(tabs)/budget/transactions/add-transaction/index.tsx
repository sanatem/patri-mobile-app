import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, AppState } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import FormLayout from '@/components/ui/FormLayout';
import { Input, Select, RadioButton } from '@/components/ui';
import CalendarSelect from '@/components/ui/CalendarSelect';
import { useFloidAccounts } from '@/hooks/budget/useFloidAccounts';
import { createFloidTransaction } from '@/services/budget/create-floid-transaction';
import { useAuth } from '@/providers/AuthProvider';
import Colors from '@/constants/Colors';

export default function AddTransactionScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const { accounts, loading: accountsLoading } = useFloidAccounts();

  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`; // formato DD/MM/YYYY
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accountOptions = useMemo(() => {
    if (!accounts || accounts.floid_accounts.length === 0) return [];

    return accounts.floid_accounts.map(account => ({
      label: `${account.bank} - ${account.account}`,
      value: account.id.toString()
    }));
  }, [accounts]);

  const transactionTypeOptions = [
    { label: t('budget.income'), value: 'income' },
    { label: t('budget.expenses'), value: 'expense' }
  ];

  const handleSubmit = async () => {
    setError(null);

    if (!selectedAccountId) {
      setError(t('budget.select_bank_account'));
      return;
    }

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

      const transactionData = {
        floid_account_id: parseInt(selectedAccountId),
        amount_in: transactionType === 'income' ? parseFloat(amount.replace(/\./g, '').replace(',', '.')) : 0,
        amount_out: transactionType === 'expense' ? parseFloat(amount.replace(/\./g, '').replace(',', '.')) : 0,
        description: description.trim(),
        date: formattedDate
      };

      await createFloidTransaction(transactionData, accessToken!);

      setIsSaved(true);

      setTimeout(() => {
        router.back();
      }, 1000);

    } catch (err) {
      console.error('Error creating transaction:', err);
      setError(err instanceof Error ? err.message : t('budget.error_saving_transaction'));
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const isFormValid = () => {
    if (!selectedAccountId || !description.trim() || !amount) {
      return false;
    }
    const cleanAmount = parseFloat(amount.replace(/[^\d]/g, ''));
    return cleanAmount > 0;
  };

  return (
    <FormLayout
      title={transactionType === 'income'
        ? t('budget.add_transaction_income')
        : t('budget.add_transaction_expense')
      }
      subtitle=""
      currentStep={1}
      totalSteps={1}
      onNext={handleSubmit}
      onCancel={handleCancel}
      nextButtonTitle={t('budget.create_transaction')}
      cancelButtonTitle={t('budget.cancel')}
      isLoading={isLoading}
      isSaved={isSaved}
      isNextDisabled={!isFormValid}
      error={error}
      showLogo={false}
      loadingText={t('budget.creating_transaction')}
      savedText={t('budget.transaction_created')}
    >
      <View style={{ gap: 20 }}>
        <RadioButton
          label={t('budget.transaction_type')}
          options={transactionTypeOptions}
          selectedValue={transactionType}
          onSelect={(value) => setTransactionType(value as 'income' | 'expense')}
        />

        <Select
          label={t('budget.transaction_bank')}
          options={accountOptions}
          value={selectedAccountId}
          onSelect={setSelectedAccountId}
          placeholder={t('budget.select_bank_account')}
          disabled={accountsLoading || accountOptions.length === 0}
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
            // Remover todo excepto números
            const numbers = text.replace(/[^\d]/g, '');
            if (numbers === '') {
              setAmount('');
              return;
            }
            // Formatear con separador de miles y símbolo de peso
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
