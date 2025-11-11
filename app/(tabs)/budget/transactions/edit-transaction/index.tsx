import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Container, Header, Input, Select, Button, KeyboardAwareContainer, LoadingSpinner } from '@/components/ui';
import CalendarSelect from '@/components/ui/CalendarSelect';
import { patchFloidTransaction } from '@/services/budget/transactions/patch-floid-transaction';
import { getFloidTransaction, type FloidTransaction } from '@/services/budget/transactions/get-floid-transactions';
import { useAuth } from '@/providers/AuthProvider';
import { getUserCategories } from '@/services/budget/categories-manager';
import type { UserCategory } from '@/services/budget/categories-manager';
import Colors from '@/constants/Colors';
import { getTranslatedNames } from '@/utils/categoryTranslations';

export default function EditTransactionScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const params = useLocalSearchParams();

  const transactionId = params.id as string;

  // Estados para la transacción
  const [transaction, setTransaction] = useState<FloidTransaction | null>(null);
  const [transactionLoading, setTransactionLoading] = useState(true);

  // Estados del formulario
  const [description, setDescription] = useState('');
  const [selectedParentCategoryId, setSelectedParentCategoryId] = useState<string>('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('');
  const [date, setDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para categorías del API
  const [apiCategories, setApiCategories] = useState<UserCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Cargar transacción desde la API
  useEffect(() => {
    const fetchTransaction = async () => {
      console.log('[EditTransaction] useEffect triggered', { accessToken: !!accessToken, transactionId });

      if (!accessToken || !transactionId) {
        console.log('[EditTransaction] Missing accessToken or transactionId');
        return;
      }

      try {
        setTransactionLoading(true);
        console.log('[EditTransaction] Fetching transaction with id:', transactionId);

        const data = await getFloidTransaction(
          { id: transactionId },
          accessToken
        );

        console.log('[EditTransaction] Transaction data received:', data);

        if (data) {
          console.log('[EditTransaction] Setting transaction data:', {
            description: data.description,
            date: data.date,
            amount: data.amount,
            category: data.category
          });

          setTransaction(data);
          setDescription(data.description || '');

          // Formatear fecha
          if (data.date) {
            const dateStr = data.date.split('T')[0];
            const parts = dateStr.split('-');
            setDate(`${parts[2]}/${parts[1]}/${parts[0]}`);
          }

          console.log('[EditTransaction] State updated successfully');
        } else {
          console.log('[EditTransaction] No data received');
        }
      } catch (error) {
        console.error('[EditTransaction] Error fetching transaction:', error);
        setError('Error al cargar la transacción');
      } finally {
        setTransactionLoading(false);
      }
    };

    fetchTransaction();
  }, [accessToken, transactionId]);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!accessToken) return;

      if (!transaction) return;

      try {
        setCategoriesLoading(true);

        const kind = transaction.transaction_type === 'income' ? 'income' : 'expense';
        const response = await getUserCategories({ kind, per_page: 100 }, accessToken);

        if (response?.success && response.data) {
          // Filtrar solo categorías padre
          const parentCategories = response.data.filter(cat => cat.parent_id === null);
          setApiCategories(parentCategories);

          // Pre-seleccionar categoría y subcategoría si existe
          if (transaction.category?.id) {
            const categoryIdStr = transaction.category.id.toString();

            // Buscar si es una categoría padre
            const parentCategory = parentCategories.find(cat => cat.id.toString() === categoryIdStr);
            if (parentCategory) {
              setSelectedParentCategoryId(categoryIdStr);
            } else {
              // Buscar si es una subcategoría
              for (const cat of parentCategories) {
                const subcategory = cat.children?.find(sub => sub.id.toString() === categoryIdStr);
                if (subcategory) {
                  setSelectedParentCategoryId(cat.id.toString());
                  setSelectedSubcategoryId(categoryIdStr);
                  break;
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [accessToken, transaction]);

  const amount = useMemo(() => {
    if (!transaction || !transaction.amount) return '';
    const numAmount = parseFloat(transaction.amount.toString());
    return Math.round(numAmount).toLocaleString('es-CL');
  }, [transaction]);

  // Opciones de categorías padre
  const categoryOptions = useMemo(() => {
    if (apiCategories.length === 0) return [];
    const isIncome = transaction?.transaction_type === 'income';
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
  }, [apiCategories, t, transaction?.transaction_type]);

  // Opciones de subcategorías basadas en la categoría seleccionada
  const subcategoryOptions = useMemo(() => {
    if (!selectedParentCategoryId || apiCategories.length === 0) return [];

    const selectedCategory = apiCategories.find(cat => cat && cat.id && cat.id.toString() === selectedParentCategoryId);
    if (!selectedCategory || !selectedCategory.children || selectedCategory.children.length === 0) return [];
    const isIncome = transaction?.transaction_type === 'income';
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
  }, [selectedParentCategoryId, apiCategories, t, transaction?.transaction_type]);

  const handleCategoryChange = (value: string) => {
    setSelectedParentCategoryId(value);
    setSelectedSubcategoryId(''); // Resetear subcategoría al cambiar categoría
  };

  const handleSubcategoryChange = (value: string) => {
    setSelectedSubcategoryId(value);
  };

  const handleSubmit = async () => {
    setError(null);

    if (!description || !description.trim()) {
      setError(t('budget.transaction_description') + ' es requerida');
      return;
    }

    try {
      setIsLoading(true);

      const dateParts = date.split('/');
      const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

      const transactionData: any = {
        description: description.trim(),
        date: formattedDate,
      };

      // Enviar subcategoría si existe, sino enviar categoría padre, o null si no hay selección
      if (selectedSubcategoryId) {
        transactionData.user_category_id = parseInt(selectedSubcategoryId);
        transactionData.auto_category = false; // Siempre manual cuando se edita
      } else if (selectedParentCategoryId) {
        transactionData.user_category_id = parseInt(selectedParentCategoryId);
        transactionData.auto_category = false; // Siempre manual cuando se edita
      } else {
        // Si no hay categoría seleccionada, enviar null para descategorizar
        transactionData.user_category_id = null;
        transactionData.auto_category = false;
      }

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
    return description && description.trim().length > 0;
  };

  // Mostrar loading mientras carga la transacción
  console.log('[EditTransaction] Render - transactionLoading:', transactionLoading, 'transaction:', !!transaction);

  if (transactionLoading || !transaction) {
    return (
      <Container variant="secondaryPage">
        <Header title={t('budget.transaction_edit', 'Editar transacción')} showBackButton />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSpinner />
        </View>
      </Container>
    );
  }

  console.log('[EditTransaction] Rendering form with description:', description);

  return (
    <Container variant="secondaryPage">
      <Header
        title={transaction.transaction_type === 'income' ? t('budget.income_singular') : t('budget.expense_singular')}
        showBackButton
      />
      <KeyboardAwareContainer style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 20 }}>
              <View style={{ alignItems: 'center', marginBottom: 24 }}>
                <Text
                  className="text-4xl font-semibold"
                  style={{
                    color: transaction.transaction_type === 'income' ? Colors.success[500] : Colors.error[500]
                  }}
                >
                  {transaction.transaction_type === 'income' ? '+' : '-'}${amount}
                </Text>
              </View>

              {categoriesLoading ? (
                <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
                  <LoadingSpinner />
                </View>
              ) : (
                <View style={{ gap: 20 }}>
                  <Input
                    label={t('budget.transaction_bank')}
                    value={`${transaction.bank} - ${transaction.account_number}`}
                    onChangeText={() => {}}
                    disabled={true}
                  />

                  <Input
                    label={t('budget.transaction_description')}
                    value={description}
                    onChangeText={setDescription}
                    placeholder={t('budget.transaction_name')}
                  />

                  <Select
                    label={t('budget.category', 'Categoría')}
                    options={categoryOptions}
                    value={selectedParentCategoryId}
                    onSelect={handleCategoryChange}
                    placeholder={t('budget.no_category', 'Sin categoría')}
                    emptyMessage={t('budget.add_categories_first', 'Debes añadir categorías para poder asignar transacciones.')}
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

                  {error && (
                    <View style={{
                      backgroundColor: Colors.error[50],
                      borderWidth: 1,
                      borderColor: Colors.error[200],
                      borderRadius: 8,
                      padding: 12,
                      marginTop: 8
                    }}>
                      <Text className="text-sm font-medium" style={{ color: Colors.error[700] }}>
                        Error
                      </Text>
                      <Text className="text-sm font-regular" style={{ color: Colors.error[600], marginTop: 4 }}>
                        {error}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </ScrollView>

          <View style={{
            backgroundColor: '#fff',
            paddingHorizontal: 24,
            paddingVertical: 16,
            paddingBottom: 32,
            gap: 10,
          }}>
            <Button
              title={isLoading ? t('common.saving', 'Guardando') : (isSaved ? t('common.saved', 'Guardado') : t('common.save', 'Guardar'))}
              onPress={handleSubmit}
              disabled={!isFormValid() || isLoading || isSaved}
              loading={isLoading}
              saved={isSaved}
              variant="primary"
              fullWidth
            />

            {!isLoading && !isSaved && (
              <Button
                title={t('budget.cancel')}
                onPress={handleCancel}
                variant="ghost"
                fullWidth
              />
            )}
          </View>
        </View>
      </KeyboardAwareContainer>
    </Container>
  );
}
