import React, { useState, useMemo, useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import FormLayout from '@/components/ui/FormLayout';
import { Input, Select, RadioButton, CalendarSelect } from '@/components/ui';
import { useAuth } from '@/providers/AuthProvider';
import { getUserCategories } from '@/services/budget/categories-manager';
import type { UserCategory } from '@/services/budget/categories-manager';
import { createBudgetTemplate } from '@/services/budget/budget-templates';
import { getTranslatedNames } from '@/utils/categoryTranslations';

export default function CreateBudgetScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { accessToken } = useAuth();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [recurrence, setRecurrence] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [apiExpenseCategories, setApiExpenseCategories] = useState<UserCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!accessToken) return;

      try {
        setCategoriesLoading(true);
        const expenseResponse = await getUserCategories({ kind: 'expense', per_page: 100 }, accessToken);

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

  const recurrenceOptions = [
    { label: t('budget.monthly', 'Mensual'), value: 'monthly' },
    { label: t('budget.weekly', 'Semanal'), value: 'weekly' },
    { label: t('budget.yearly', 'Anual'), value: 'yearly' }
  ];

  const categoryOptions = useMemo(() => {
    if (apiExpenseCategories.length === 0) return [];
    const currentLang = t('common.language_code', 'es');

    return apiExpenseCategories
      .filter(category => category && category.id !== undefined && category.id !== null)
      .map(category => {
        const translatedNames = getTranslatedNames(category.display_name, false);
        return {
          label: `${category.emoji_code || ''} ${translatedNames[currentLang as 'en' | 'es' | 'es-CL'] || category.display_name || ''}`.trim(),
          value: category.id.toString()
        };
      });
  }, [t, apiExpenseCategories]);

  const handleRecurrenceChange = (value: string) => {
    setRecurrence(value as 'monthly' | 'weekly' | 'yearly');
  };

  const handleSubmit = async () => {
    setError(null);

    if (!selectedCategoryId) {
      setError(t('budget.select_category_error', 'Selecciona una categoría'));
      return;
    }

    if (!amount) {
      setError(t('budget.amount_required', 'El monto es requerido'));
      return;
    }

    const cleanAmount = amount.replace(/[$\s]/g, '').replace(/\./g, '').replace(',', '.');
    const parsedAmount = parseFloat(cleanAmount);

    if (parsedAmount <= 0) {
      setError(t('budget.amount_greater_zero', 'El monto debe ser mayor a 0'));
      return;
    }

    try {
      setIsLoading(true);

      // Convertir fecha de dd/mm/yyyy a yyyy-mm-dd
      let formattedStartDate: string | undefined;
      if (startDate) {
        const [day, month, year] = startDate.split('/');
        formattedStartDate = `${year}-${month}-${day}`;
      }

      await createBudgetTemplate({
        user_category_id: parseInt(selectedCategoryId),
        amount: parsedAmount,
        recurrence: recurrence,
        ...(formattedStartDate && { start_date: formattedStartDate })
      }, accessToken!);

      setIsSaved(true);

      setTimeout(() => {
        router.back();
      }, 1000);

    } catch (err) {
      console.error('Error creating budget:', err);
      setError(err instanceof Error ? err.message : t('budget.error_creating_budget', 'Error al crear el presupuesto'));
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const isFormValid = () => {
    if (!selectedCategoryId || !amount) {
      return false;
    }
    const cleanAmount = parseFloat(amount.replace(/[^\d]/g, ''));
    return cleanAmount > 0;
  };

  return (
    <FormLayout
      title={t('budget.create_budget_title', 'Crear Presupuesto')}
      subtitle={t('budget.create_budget_subtitle', 'Define un límite de gasto para una categoría. Recibirás alertas cuando te acerques al límite.')}
      currentStep={1}
      totalSteps={1}
      onNext={handleSubmit}
      onCancel={handleCancel}
      nextButtonTitle={t('budget.create_budget_button', 'Crear Presupuesto')}
      cancelButtonTitle={t('common.cancel', 'Cancelar')}
      isLoading={isLoading}
      isSaved={isSaved}
      isNextDisabled={!isFormValid}
      error={error}
      showLogo={false}
      loadingText={t('budget.creating_budget', 'Creando presupuesto...')}
      savedText={t('budget.budget_created', 'Presupuesto creado')}
    >
      <View style={{ gap: 20 }}>
        <Select
          label={t('budget.category', 'Categoría')}
          options={categoryOptions}
          value={selectedCategoryId}
          onSelect={setSelectedCategoryId}
          placeholder={t('budget.select_category', 'Seleccionar categoría')}
          disabled={categoriesLoading || categoryOptions.length === 0}
          emptyMessage={t('budget.add_categories_first', 'Debes añadir categorías para poder crear presupuestos.')}
        />

        <Input
          label={t('budget.budget_amount', 'Monto del presupuesto')}
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
          label={t('budget.start_date', 'Desde')}
          value={startDate}
          onSelect={setStartDate}
          placeholder={t('budget.select_start_date', 'Seleccionar fecha de inicio')}
        />

        <RadioButton
          label={t('budget.recurrence', 'Frecuencia')}
          options={recurrenceOptions}
          selectedValue={recurrence}
          onSelect={handleRecurrenceChange}
          horizontal={true}
        />
      </View>
    </FormLayout>
  );
}
