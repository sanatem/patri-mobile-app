import React, { useState, useMemo, useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import FormLayout from '@/components/ui/FormLayout';
import { Input, Select, RadioButton } from '@/components/ui';
import CalendarSelect from '@/components/ui/CalendarSelect';
import { useFloidAccounts } from '@/hooks/budget/useFloidAccounts';
import { createFloidTransaction } from '@/services/budget/transactions/create-floid-transaction';
import { useAuth } from '@/providers/AuthProvider';
import { getUserCategories } from '@/services/budget/categories-manager';
import type { UserCategory } from '@/services/budget/categories-manager';
import { getTranslatedNames } from '@/utils/categoryTranslations';

export default function AddTransactionScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const { accounts, loading: accountsLoading } = useFloidAccounts();

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
          // Filtrar solo categorías padre
          const parentCategories = incomeResponse.data.filter(cat => cat.parent_id === null);
          setApiIncomeCategories(parentCategories);
        }
        if (expenseResponse?.success && expenseResponse.data) {
          // Filtrar solo categorías padre
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

  const categoryOptions = useMemo(() => {
    const apiCategories = transactionType === 'income' ? apiIncomeCategories : apiExpenseCategories;
    if (apiCategories.length === 0) return [];
    const isIncome = transactionType === 'income';
    const currentLang = t('common.language_code', 'es');

    return [
      { label: t('budget.no_category', 'Sin categoría'), value: '' },
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
      { label: t('budget.no_subcategory', 'Sin subcategoría'), value: '' },
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

      // Limpiar el amount: remover $, puntos de miles y convertir coma a punto decimal
      const cleanAmount = amount.replace(/[$\s]/g, '').replace(/\./g, '').replace(',', '.');
      const parsedAmount = parseFloat(cleanAmount);

      const transactionData: any = {
        floid_account_id: parseInt(selectedAccountId),
        amount_in: transactionType === 'income' ? parsedAmount : 0,
        amount_out: transactionType === 'expense' ? parsedAmount : 0,
        description: description.trim(),
        date: formattedDate,
      };

      if (selectedSubcategoryId) {
        transactionData.user_category_id = parseInt(selectedSubcategoryId);
        transactionData.auto_category = false;
      } else if (selectedParentCategoryId) {
        transactionData.user_category_id = parseInt(selectedParentCategoryId);
        transactionData.auto_category = false;
      } else {
        transactionData.user_category_id = null;
        transactionData.auto_category = false;
      }

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
          onSelect={handleTransactionTypeChange}
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
          label={t('budget.category', 'Categoría')}
          options={categoryOptions}
          value={selectedParentCategoryId}
          onSelect={handleCategoryChange}
          placeholder={t('budget.no_category', 'Sin categoría')}
        />

        {selectedParentCategoryId && subcategoryOptions.length > 0 && (
          <Select
            label={t('budget.subcategory', 'Subcategoría')}
            options={subcategoryOptions}
            value={selectedSubcategoryId}
            onSelect={handleSubcategoryChange}
            placeholder={t('budget.no_subcategory', 'Sin subcategoría')}
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
