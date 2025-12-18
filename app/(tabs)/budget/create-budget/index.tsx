import React, { useState, useMemo, useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import FormLayout from '@/components/ui/FormLayout';
import { Input, Select, RadioButton, CalendarSelect } from '@/components/ui';
import { useAuth } from '@/providers/AuthProvider';
import { getUserCategories } from '@/services/budget/categories-manager';
import type { UserCategory } from '@/services/budget/categories-manager';
import { createBudgetTemplate, getBudgetTemplates } from '@/services/budget/budget-templates';
import type { BudgetTemplate } from '@/services/budget/budget-templates/types';
import { getTranslatedNames } from '@/utils/categoryTranslations';

export default function CreateBudgetScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { accessToken } = useAuth();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [recurrence, setRecurrence] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');
  const [startDate, setStartDate] = useState<string>(() => {
    const now = new Date();
    const day = '01';
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [apiExpenseCategories, setApiExpenseCategories] = useState<UserCategory[]>([]);
  const [expenseSubcategories, setExpenseSubcategories] = useState<UserCategory[]>([]);
  const [existingTemplates, setExistingTemplates] = useState<BudgetTemplate[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [subcategoriesLoading, setSubcategoriesLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!accessToken) return;

      try {
        setCategoriesLoading(true);

        const [expenseResponse, templatesResponse] = await Promise.all([
          getUserCategories({ kind: 'expense', per_page: 100 }, accessToken),
          getBudgetTemplates(accessToken).catch(() => null)
        ]);

        if (expenseResponse?.success && expenseResponse.data) {
          const parentCategories = expenseResponse.data.filter(cat => cat.parent_id === null);
          setApiExpenseCategories(parentCategories);
        }

        if (templatesResponse?.success && templatesResponse.budget_templates) {
          setExistingTemplates(templatesResponse.budget_templates);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchData();
  }, [accessToken]);

  // Fetch expense subcategories when parent category changes
  useEffect(() => {
    const fetchExpenseSubcategories = async () => {
      if (!accessToken || !selectedCategoryId) {
        setExpenseSubcategories([]);
        setSelectedSubcategoryId('');
        return;
      }

      try {
        setSubcategoriesLoading(true);
        const response = await getUserCategories({
          kind: 'expense',
          parent_id: parseInt(selectedCategoryId),
          per_page: 100
        }, accessToken);

        if (response?.success && response.data) {
          setExpenseSubcategories(response.data);
        } else {
          setExpenseSubcategories([]);
        }
      } catch (error) {
        console.error('Error fetching expense subcategories:', error);
        setExpenseSubcategories([]);
      } finally {
        setSubcategoriesLoading(false);
      }
    };

    fetchExpenseSubcategories();
    setSelectedSubcategoryId('');
  }, [accessToken, selectedCategoryId]);

  const recurrenceOptions = [
    { label: t('budget.monthly', 'Mensual'), value: 'monthly' },
    { label: t('budget.weekly', 'Semanal'), value: 'weekly' },
    { label: t('budget.yearly', 'Anual'), value: 'yearly' }
  ];

  // Get IDs of categories that already have budgets assigned
  const categoriesWithBudgets = useMemo(() => {
    return new Set(existingTemplates.map(t => t.user_category.id));
  }, [existingTemplates]);

  // Check if selected category already has a budget
  const selectedCategoryHasBudget = useMemo(() => {
    if (!selectedCategoryId) return false;
    return categoriesWithBudgets.has(parseInt(selectedCategoryId));
  }, [selectedCategoryId, categoriesWithBudgets]);

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

  // Subcategory options for expense categories
  const subcategoryOptions = useMemo(() => {
    if (expenseSubcategories.length === 0) return [];
    const currentLang = t('common.language_code', 'es');

    const availableSubcategories = expenseSubcategories
      .filter(cat => !categoriesWithBudgets.has(cat.id))
      .map(category => {
        const translatedNames = getTranslatedNames(category.display_name, false);
        return {
          label: `${category.emoji_code || ''} ${translatedNames[currentLang as 'en' | 'es' | 'es-CL'] || category.display_name || ''}`.trim(),
          value: category.id.toString()
        };
      });

    if (availableSubcategories.length === 0) {
      return [];
    }

    // Solo agregar opción "Sin subcategoría" si la categoría padre NO tiene presupuesto
    if (!selectedCategoryHasBudget) {
      const defaultOption = {
        label: t('budget.no_subcategory', 'Sin subcategoría'),
        value: 'none'
      };
      return [defaultOption, ...availableSubcategories];
    }

    return availableSubcategories;
  }, [t, expenseSubcategories, categoriesWithBudgets, selectedCategoryHasBudget]);

  const handleRecurrenceChange = (value: string) => {
    setRecurrence(value as 'monthly' | 'weekly' | 'yearly');
  };

  const handleSubmit = async () => {
    setError(null);

    if (!selectedCategoryId) {
      setError(t('budget.select_category_error', 'Selecciona una categoría'));
      return;
    }

    const hasValidSubcategory = selectedSubcategoryId && selectedSubcategoryId !== 'none';
    if (selectedCategoryHasBudget && !hasValidSubcategory) {
      setError(t('budget.category_has_budget', 'Esta categoría ya tiene un presupuesto asignado. Selecciona una subcategoría.'));
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

      const [day, month, year] = startDate.split('/');
      const formattedStartDate = `${year}-${month}-${day}`;

      const categoryIdToUse = (selectedSubcategoryId && selectedSubcategoryId !== 'none')
        ? selectedSubcategoryId
        : selectedCategoryId;

      await createBudgetTemplate({
        user_category_id: parseInt(categoryIdToUse),
        amount: parsedAmount,
        recurrence: recurrence,
        start_date: formattedStartDate,
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
    if (!selectedCategoryId) {
      return false;
    }

    const hasValidSubcategory = selectedSubcategoryId && selectedSubcategoryId !== 'none';
    if (selectedCategoryHasBudget && !hasValidSubcategory) {
      return false;
    }

    if (!amount) {
      return false;
    }
    const cleanAmount = parseFloat(amount.replace(/[^\d]/g, ''));
    if (cleanAmount <= 0) {
      return false;
    }

    return true;
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
      isNextDisabled={!isFormValid()}
      error={error}
      showLogo={false}
      loadingText={t('budget.creating_budget', 'Creando presupuesto...')}
      savedText={t('budget.budget_created', 'Presupuesto creado')}
    >
      <View style={{ gap: 20 }}>
        <Select
          label={t('budget.expense_category', 'Categoría de Gasto')}
          options={categoryOptions}
          value={selectedCategoryId}
          onSelect={setSelectedCategoryId}
          placeholder={t('budget.select_category', 'Seleccionar categoría')}
          disabled={categoriesLoading || categoryOptions.length === 0}
          emptyMessage={t('budget.add_categories_first', 'Debes añadir categorías para poder crear presupuestos.')}
        />

        {selectedCategoryId && (subcategoriesLoading || subcategoryOptions.length > 0) && (
          <Select
            label={selectedCategoryHasBudget
              ? t('budget.expense_subcategory', 'Subcategoría de Gasto')
              : `${t('budget.expense_subcategory', 'Subcategoría de Gasto')} *`
            }
            options={subcategoryOptions}
            value={selectedSubcategoryId}
            onSelect={setSelectedSubcategoryId}
            placeholder={t('budget.select_subcategory', 'Seleccionar subcategoría')}
            disabled={subcategoriesLoading}
            emptyMessage={t('budget.no_subcategories', 'No hay subcategorías disponibles')}
            error={
              selectedCategoryHasBudget && (!selectedSubcategoryId || selectedSubcategoryId === 'none')
                ? t('budget.category_has_budget_warning', 'La categoría de gasto ya tiene un presupuesto asignado. Debes seleccionar una subcategoría.')
                : undefined
            }
          />
        )}

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

        <RadioButton
          label={t('budget.recurrence', 'Frecuencia')}
          options={recurrenceOptions}
          selectedValue={recurrence}
          onSelect={handleRecurrenceChange}
          horizontal={true}
        />

        <CalendarSelect
          label={t('budget.start_date', 'Desde')}
          value={startDate}
          onSelect={setStartDate}
          placeholder={t('budget.select_start_date', 'Seleccionar fecha de inicio')}
        />
      </View>
    </FormLayout>
  );
}
