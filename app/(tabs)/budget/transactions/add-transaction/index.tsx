import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import FormLayout from '@/components/ui/FormLayout';
import { Input, Select, RadioButton, Button } from '@/components/ui';
import CalendarSelect from '@/components/ui/CalendarSelect';
import { useFloidAccounts } from '@/hooks/budget/useFloidAccounts';
import { useBankAccounts } from '@/hooks/budget/useBankAccounts';
import { useTransactionMode } from '@/providers/TransactionModeProvider';
import { createFloidTransaction } from '@/services/budget/transactions/create-floid-transaction';
import { createManualTransaction } from '@/services/budget/transactions/manual-transactions';
import { useAuth } from '@/providers/AuthProvider';
import { getUserCategories } from '@/services/budget/categories-manager';
import type { UserCategory } from '@/services/budget/categories-manager';
import { getTranslatedNames } from '@/utils/categoryTranslations';
import Colors from '@/constants/Colors';
import { Plus } from 'lucide-react-native';

export default function AddTransactionScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const { mode, loading: modeLoading } = useTransactionMode();
  const { accounts: floidAccounts, loading: floidAccountsLoading } = useFloidAccounts();
  const { accounts: bankAccounts, loading: bankAccountsLoading, hasAccounts: hasBankAccounts, refetch: refetchBankAccounts } = useBankAccounts();

  // Refetch bank accounts when screen comes into focus (e.g., after adding a new account)
  useFocusEffect(
    useCallback(() => {
      refetchBankAccounts();
    }, [refetchBankAccounts])
  );

  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [selectedParentCategoryId, setSelectedParentCategoryId] = useState('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [apiIncomeCategories, setApiIncomeCategories] = useState<UserCategory[]>([]);
  const [apiExpenseCategories, setApiExpenseCategories] = useState<UserCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!accessToken) return;

      try {
        setCategoriesLoading(true);
        const [incomeResponse, expenseResponse] = await Promise.all([
          getUserCategories({ kind: 'income', per_page: 100 }, accessToken),
          getUserCategories({ kind: 'expense', per_page: 100 }, accessToken)
        ]);

        if (incomeResponse?.success && incomeResponse.data) {
          const parentCategories = incomeResponse.data.filter(cat => cat.parent_id === null);
          setApiIncomeCategories(parentCategories);
        }
        if (expenseResponse?.success && expenseResponse.data) {
          const parentCategories = expenseResponse.data.filter(cat => cat.parent_id === null);
          setApiExpenseCategories(parentCategories);
        }
      } catch (error) {
        console.error('Error fetching user categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [accessToken]);

  // Account options based on mode
  const accountOptions = useMemo(() => {
    if (mode === 'floid') {
      if (!floidAccounts || floidAccounts.floid_accounts.length === 0) return [];
      return floidAccounts.floid_accounts.map(account => ({
        label: `${account.bank} - ${account.account}`,
        value: account.id.toString()
      }));
    } else if (mode === 'bank_account') {
      if (!bankAccounts || bankAccounts.length === 0) return [];
      return bankAccounts.map(account => ({
        label: account.label,
        value: account.id.toString()
      }));
    }
    return [];
  }, [mode, floidAccounts, bankAccounts]);

  const accountsLoading = mode === 'floid' ? floidAccountsLoading : bankAccountsLoading;

  const transactionTypeOptions = [
    { label: t('budget.income'), value: 'income' },
    { label: t('budget.expenses'), value: 'expense' }
  ];

  const categoryOptions = useMemo(() => {
    const apiCategories = transactionType === 'income' ? apiIncomeCategories : apiExpenseCategories;
    if (apiCategories.length === 0) return [];
    const isIncome = transactionType === 'income';
    const currentLang = t('common.language_code', 'es');

    return [
      { label: t('budget.no_category', 'Sin categoria'), value: '' },
      ...apiCategories
        .filter(category => category && category.id !== undefined && category.id !== null)
        .map(category => {
          const translatedNames = getTranslatedNames(category.display_name, isIncome);
          return {
            label: translatedNames[currentLang as 'en' | 'es' | 'es-CL'] || category.display_name || '',
            value: category.id.toString()
          };
        })
    ];
  }, [t, transactionType, apiIncomeCategories, apiExpenseCategories]);

  const subcategoryOptions = useMemo(() => {
    if (!selectedParentCategoryId) return [];

    const apiCategories = transactionType === 'income' ? apiIncomeCategories : apiExpenseCategories;
    const selectedCategory = apiCategories.find(cat => cat && cat.id && cat.id.toString() === selectedParentCategoryId);

    if (!selectedCategory || !selectedCategory.children || selectedCategory.children.length === 0) return [];
    const isIncome = transactionType === 'income';
    const currentLang = t('common.language_code', 'es');

    return [
      { label: t('budget.no_subcategory', 'Sin subcategoria'), value: '' },
      ...selectedCategory.children
        .filter(subcat => subcat && subcat.id !== undefined && subcat.id !== null)
        .map(subcat => {
          const translatedNames = getTranslatedNames(subcat.display_name, isIncome);
          return {
            label: translatedNames[currentLang as 'en' | 'es' | 'es-CL'] || subcat.display_name || '',
            value: subcat.id.toString()
          };
        })
    ];
  }, [selectedParentCategoryId, t, transactionType, apiIncomeCategories, apiExpenseCategories]);

  const handleCategoryChange = (value: string) => {
    setSelectedParentCategoryId(value);
    setSelectedSubcategoryId('');
  };

  const handleSubcategoryChange = (value: string) => {
    setSelectedSubcategoryId(value);
  };

  const handleTransactionTypeChange = (value: string) => {
    setTransactionType(value as 'income' | 'expense');
    setSelectedParentCategoryId('');
    setSelectedSubcategoryId('');
  };

  const handleAddBankAccount = () => {
    router.push('/settings/bank-accounts/add-bank-account' as any);
  };

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

      const cleanAmount = amount.replace(/[$\s]/g, '').replace(/\./g, '').replace(',', '.');
      const parsedAmount = parseFloat(cleanAmount);

      const categoryId = selectedSubcategoryId
        ? parseInt(selectedSubcategoryId)
        : selectedParentCategoryId
          ? parseInt(selectedParentCategoryId)
          : null;

      if (mode === 'floid') {
        const transactionData: any = {
          floid_account_id: parseInt(selectedAccountId),
          amount_in: transactionType === 'income' ? parsedAmount : 0,
          amount_out: transactionType === 'expense' ? parsedAmount : 0,
          description: description.trim(),
          date: formattedDate,
        };

        if (categoryId) {
          transactionData.user_category_id = categoryId;
          transactionData.auto_category = false;
        } else {
          transactionData.user_category_id = null;
          transactionData.auto_category = false;
        }

        await createFloidTransaction(transactionData, accessToken!);
      } else if (mode === 'bank_account') {
        const transactionData = {
          bank_account_id: parseInt(selectedAccountId),
          amount_in: transactionType === 'income' ? parsedAmount : 0,
          amount_out: transactionType === 'expense' ? parsedAmount : 0,
          description: description.trim(),
          date: formattedDate,
          user_category_id: categoryId,
        };

        await createManualTransaction(transactionData, accessToken!);
      }

      setIsSaved(true);

      setTimeout(() => {
        // Navigate back with the selected account ID to filter transactions
        router.replace({
          pathname: '/(tabs)/budget/transactions' as any,
          params: { accountId: selectedAccountId }
        });
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

  const showNoAccountsMessage = (mode === 'bank_account' || mode === 'none') && !hasBankAccounts && !bankAccountsLoading;

  return (
    <FormLayout
      title={transactionType === 'income'
        ? t('budget.add_transaction_income')
        : t('budget.add_transaction_expense')
      }
      subtitle="Esta transaccion se registra solo en la app para tu control personal. No se realizaran movimientos reales en tu cuenta bancaria."
      currentStep={1}
      totalSteps={1}
      onNext={handleSubmit}
      onCancel={handleCancel}
      nextButtonTitle={t('budget.create_transaction')}
      cancelButtonTitle={t('budget.cancel')}
      isLoading={isLoading}
      isSaved={isSaved}
      isNextDisabled={!isFormValid() || showNoAccountsMessage}
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
          onSelect={handleTransactionTypeChange}
          horizontal={true}
        />

        {showNoAccountsMessage ? (
          <View style={{
            backgroundColor: 'white',
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors.gray[100],
            borderStyle: 'dashed'
          }}>
            <Text className="text-sm font-regular text-center mb-2" style={{
              color: Colors.primary[500],
              marginBottom: 12
            }}>
              {t('budget.no_bank_accounts_message', 'No tienes cuentas bancarias registradas. Agrega una cuenta para poder registrar transacciones.')}
            </Text>
            <Button
              title={t('budget.add_bank_account', 'Agregar cuenta bancaria')}
              onPress={handleAddBankAccount}
              variant="primary"
              fullWidth
              icon={<Plus size={18} />}
            />
          </View>
        ) : (
          <Select
            label={t('budget.account', 'Cuenta')}
            options={accountOptions}
            value={selectedAccountId}
            onSelect={setSelectedAccountId}
            placeholder={t('budget.select_account', 'Seleccionar cuenta')}
            disabled={accountsLoading || accountOptions.length === 0}
          />
        )}

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

        <Select
          label={t('budget.category', 'Categoria')}
          options={categoryOptions}
          value={selectedParentCategoryId}
          onSelect={handleCategoryChange}
          placeholder={t('budget.no_category', 'Sin categoria')}
          emptyMessage={t('budget.add_categories_first', 'Debes añadir categorias para poder asignar transacciones.')}
        />

        {selectedParentCategoryId && subcategoryOptions.length > 0 && (
          <Select
            label={t('budget.subcategory', 'Subcategoria')}
            options={subcategoryOptions}
            value={selectedSubcategoryId}
            onSelect={handleSubcategoryChange}
            placeholder={t('budget.no_subcategory', 'Sin subcategoria')}
          />
        )}

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
