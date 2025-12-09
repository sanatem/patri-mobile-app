import React, { useState, useMemo, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import FormLayout from '@/components/ui/FormLayout';
import { Input, Select, RadioButton, Card } from '@/components/ui';
import { useAuth } from '@/providers/AuthProvider';
import { getUserCategories } from '@/services/budget/categories-manager';
import type { UserCategory } from '@/services/budget/categories-manager';
import { createBudgetTemplate, getBudgetTemplates } from '@/services/budget/budget-templates';
import type { BudgetTemplate } from '@/services/budget/budget-templates/types';
import { getIncomeSources, type IncomeSource } from '@/services/budget/budget-instances';
import { getTranslatedNames } from '@/utils/categoryTranslations';
import Colors from '@/constants/Colors';

export default function CreateBudgetScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { accessToken } = useAuth();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('');
  const [selectedIncomeCategoryId, setSelectedIncomeCategoryId] = useState<string>('');
  const [selectedIncomeSubcategoryId, setSelectedIncomeSubcategoryId] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [recurrence, setRecurrence] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [apiExpenseCategories, setApiExpenseCategories] = useState<UserCategory[]>([]);
  const [expenseSubcategories, setExpenseSubcategories] = useState<UserCategory[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<UserCategory[]>([]);
  const [incomeSubcategories, setIncomeSubcategories] = useState<UserCategory[]>([]);
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [existingTemplates, setExistingTemplates] = useState<BudgetTemplate[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [subcategoriesLoading, setSubcategoriesLoading] = useState(false);

  // Get current month date range for income sources
  const getMonthDateRange = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const formatDate = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    return { start_date: formatDate(startDate), end_date: formatDate(endDate) };
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!accessToken) return;

      try {
        setCategoriesLoading(true);

        const { start_date, end_date } = getMonthDateRange();

        // Fetch expense categories, income categories, income sources, and existing templates in parallel
        const [expenseResponse, incomeResponse, incomeSourcesResponse, templatesResponse] = await Promise.all([
          getUserCategories({ kind: 'expense', per_page: 100 }, accessToken),
          getUserCategories({ kind: 'income', per_page: 100 }, accessToken),
          getIncomeSources({ start_date, end_date }, accessToken).catch(() => null),
          getBudgetTemplates(accessToken).catch(() => null)
        ]);

        if (expenseResponse?.success && expenseResponse.data) {
          const parentCategories = expenseResponse.data.filter(cat => cat.parent_id === null);
          setApiExpenseCategories(parentCategories);
        }

        if (incomeResponse?.success && incomeResponse.data) {
          const parentCategories = incomeResponse.data.filter(cat => cat.parent_id === null);
          setIncomeCategories(parentCategories);
        }

        if (incomeSourcesResponse?.success && incomeSourcesResponse.data?.income_sources) {
          setIncomeSources(incomeSourcesResponse.data.income_sources);
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
    setSelectedSubcategoryId(''); // Reset subcategory when parent changes
  }, [accessToken, selectedCategoryId]);

  // Fetch income subcategories when parent income category changes
  useEffect(() => {
    const fetchIncomeSubcategories = async () => {
      if (!accessToken || !selectedIncomeCategoryId) {
        setIncomeSubcategories([]);
        setSelectedIncomeSubcategoryId('');
        return;
      }

      try {
        const response = await getUserCategories({
          kind: 'income',
          parent_id: parseInt(selectedIncomeCategoryId),
          per_page: 100
        }, accessToken);

        if (response?.success && response.data) {
          setIncomeSubcategories(response.data);
        } else {
          setIncomeSubcategories([]);
        }
      } catch (error) {
        console.error('Error fetching income subcategories:', error);
        setIncomeSubcategories([]);
      }
    };

    fetchIncomeSubcategories();
    setSelectedIncomeSubcategoryId(''); // Reset subcategory when parent changes
  }, [accessToken, selectedIncomeCategoryId]);

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
        const hasBudget = categoriesWithBudgets.has(category.id);
        return {
          label: `${category.emoji_code || ''} ${translatedNames[currentLang as 'en' | 'es' | 'es-CL'] || category.display_name || ''}${hasBudget ? ' ✓' : ''}`.trim(),
          value: category.id.toString()
        };
      });
  }, [t, apiExpenseCategories, categoriesWithBudgets]);

  // Subcategory options for expense categories
  const subcategoryOptions = useMemo(() => {
    if (expenseSubcategories.length === 0) return [];
    const currentLang = t('common.language_code', 'es');

    const defaultOption = {
      label: t('budget.no_subcategory', 'Sin subcategoría'),
      value: 'none'
    };

    const subcategories = expenseSubcategories
      .filter(cat => !categoriesWithBudgets.has(cat.id)) // Filter out subcategories with existing budgets
      .map(category => {
        const translatedNames = getTranslatedNames(category.display_name, false);
        return {
          label: `${category.emoji_code || ''} ${translatedNames[currentLang as 'en' | 'es' | 'es-CL'] || category.display_name || ''}`.trim(),
          value: category.id.toString()
        };
      });

    return [defaultOption, ...subcategories];
  }, [t, expenseSubcategories, categoriesWithBudgets]);

  // Income subcategory options - usar incomeSources para obtener saldos
  const incomeSubcategoryOptions = useMemo(() => {
    if (incomeSubcategories.length === 0) return [];
    const currentLang = t('common.language_code', 'es');

    const defaultOption = {
      label: t('budget.no_subcategory', 'Sin subcategoría'),
      value: 'none'
    };

    const subcategories = incomeSubcategories
      .filter(cat => !categoriesWithBudgets.has(cat.id))
      .map(category => {
        // Buscar en incomeSources para obtener el saldo disponible
        const sourceData = incomeSources.find(s => s.id === category.id);
        const translatedNames = getTranslatedNames(category.display_name, false);
        const displayName = translatedNames[currentLang as 'en' | 'es' | 'es-CL'] || category.display_name || '';
        const availableBalance = sourceData ? ` ($${sourceData.available.toLocaleString('es-CL')} disponible)` : '';

        return {
          label: `${category.emoji_code || ''} ${displayName}${availableBalance}`.trim(),
          value: category.id.toString()
        };
      });

    return [defaultOption, ...subcategories];
  }, [t, incomeSubcategories, categoriesWithBudgets, incomeSources]);

  // Convert emoji code to actual emoji
  const emojiFromCode = (code: string): string => {
    if (!code) return '💰';
    try {
      // If it's already an emoji, return it
      if (code.length <= 2) return code;
      // Convert hex code to emoji
      return String.fromCodePoint(parseInt(code, 16));
    } catch {
      return '💰';
    }
  };

  const incomeSourceOptions = useMemo(() => {
    if (incomeSources.length === 0) return [];

    // Filtrar solo las categorías padre (las que están en incomeCategories)
    const parentCategoryIds = new Set(incomeCategories.map(c => c.id));

    return incomeSources
      .filter(source => parentCategoryIds.has(source.id))
      .map(source => ({
        label: `${emojiFromCode(source.emoji_code)} ${source.display_name || source.name} ($${source.available.toLocaleString('es-CL')} disponible)`,
        value: source.id.toString()
      }));
  }, [incomeSources, incomeCategories]);

  // Get selected income source details - priorizar subcategoría si está seleccionada
  const selectedIncomeSource = useMemo(() => {
    // Si hay subcategoría seleccionada y no es 'none', buscar esa
    if (selectedIncomeSubcategoryId && selectedIncomeSubcategoryId !== 'none') {
      return incomeSources.find(source => source.id.toString() === selectedIncomeSubcategoryId) || null;
    }
    // Si no, buscar la categoría padre
    if (!selectedIncomeCategoryId) return null;
    return incomeSources.find(source => source.id.toString() === selectedIncomeCategoryId) || null;
  }, [selectedIncomeCategoryId, selectedIncomeSubcategoryId, incomeSources]);

  const handleRecurrenceChange = (value: string) => {
    setRecurrence(value as 'monthly' | 'weekly' | 'yearly');
  };

  const handleSubmit = async () => {
    setError(null);

    if (!selectedCategoryId) {
      setError(t('budget.select_category_error', 'Selecciona una categoría'));
      return;
    }

    // Si la categoría padre ya tiene presupuesto y no se seleccionó subcategoría válida, mostrar error
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

      // Siempre usar el día 1 del mes actual como start_date
      const now = new Date();
      const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

      // Usar subcategoría si está seleccionada y no es 'none', de lo contrario usar categoría padre
      const categoryIdToUse = (selectedSubcategoryId && selectedSubcategoryId !== 'none')
        ? selectedSubcategoryId
        : selectedCategoryId;

      // Para income, usar subcategoría si está seleccionada y no es 'none'
      const hasValidIncomeSubcategory = selectedIncomeSubcategoryId && selectedIncomeSubcategoryId !== 'none';
      const incomeIdToUse = hasValidIncomeSubcategory
        ? selectedIncomeSubcategoryId
        : selectedIncomeCategoryId;

      await createBudgetTemplate({
        user_category_id: parseInt(categoryIdToUse),
        amount: parsedAmount,
        recurrence: recurrence,
        start_date: startDate,
        ...(incomeIdToUse && { income_user_category_id: parseInt(incomeIdToUse) })
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
    // Categoría requerida
    if (!selectedCategoryId) {
      return false;
    }

    // Si la categoría ya tiene presupuesto, la subcategoría es requerida (y no puede ser 'none')
    const hasValidSubcategory = selectedSubcategoryId && selectedSubcategoryId !== 'none';
    if (selectedCategoryHasBudget && !hasValidSubcategory) {
      return false;
    }

    // Monto requerido y mayor a 0
    if (!amount) {
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
            label={t('budget.expense_subcategory', 'Subcategoría de Gasto (opcional)')}
            options={subcategoryOptions}
            value={selectedSubcategoryId}
            onSelect={setSelectedSubcategoryId}
            placeholder={t('budget.select_subcategory', 'Seleccionar subcategoría')}
            disabled={subcategoriesLoading}
            emptyMessage={t('budget.no_subcategories', 'No hay subcategorías disponibles')}
          />
        )}

        {selectedCategoryHasBudget && !selectedSubcategoryId && subcategoryOptions.length > 0 && (
          <Text style={{ color: Colors.warning[600], fontSize: 12 }}>
            {t('budget.category_has_budget_warning', 'Esta categoría ya tiene presupuesto. Selecciona una subcategoría para crear un presupuesto adicional.')}
          </Text>
        )}

        <Select
          label={t('budget.income_category', 'Fuente de Ingreso')}
          options={incomeSourceOptions}
          value={selectedIncomeCategoryId}
          onSelect={setSelectedIncomeCategoryId}
          placeholder={t('budget.select_income_category', 'Seleccionar fuente de ingreso')}
          disabled={categoriesLoading || incomeSourceOptions.length === 0}
          emptyMessage={t('budget.add_income_categories_first', 'Debes añadir categorías de ingreso.')}
        />

        {selectedIncomeCategoryId && incomeSubcategoryOptions.length > 0 && (
          <Select
            label={t('budget.income_subcategory', 'Subcategoría de Ingreso (opcional)')}
            options={incomeSubcategoryOptions}
            value={selectedIncomeSubcategoryId}
            onSelect={setSelectedIncomeSubcategoryId}
            placeholder={t('budget.select_income_subcategory', 'Seleccionar subcategoría')}
            emptyMessage={t('budget.no_subcategories', 'No hay subcategorías disponibles')}
          />
        )}

        {selectedIncomeSource && (
          <Card variant="default" size="sm">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Text className="text-xl mr-2">{emojiFromCode(selectedIncomeSource.emoji_code)}</Text>
                <Text className="text-sm font-medium" style={{ color: Colors.gray[700] }}>
                  {selectedIncomeSource.display_name || selectedIncomeSource.name}
                </Text>
              </View>
            </View>
            <View className="flex-row justify-between">
              <View>
                <Text className="text-xs" style={{ color: Colors.gray[500] }}>
                  {t('budget.total_income', 'Total ingreso')}
                </Text>
                <Text className="text-sm font-medium" style={{ color: Colors.gray[700] }}>
                  ${selectedIncomeSource.total_income.toLocaleString('es-CL')}
                </Text>
              </View>
              <View>
                <Text className="text-xs" style={{ color: Colors.gray[500] }}>
                  {t('budget.allocated', 'Asignado')}
                </Text>
                <Text className="text-sm font-medium" style={{ color: Colors.warning[600] }}>
                  ${selectedIncomeSource.allocated.toLocaleString('es-CL')}
                </Text>
              </View>
              <View>
                <Text className="text-xs" style={{ color: Colors.gray[500] }}>
                  {t('budget.available_balance', 'Disponible')}
                </Text>
                <Text className="text-sm font-semibold" style={{ color: Colors.success[600] }}>
                  ${selectedIncomeSource.available.toLocaleString('es-CL')}
                </Text>
              </View>
            </View>
          </Card>
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
      </View>
    </FormLayout>
  );
}
