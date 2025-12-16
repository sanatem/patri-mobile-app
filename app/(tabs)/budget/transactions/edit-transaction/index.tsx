import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Container, Header, Input, Select, Button, KeyboardAwareContainer, LoadingSpinner } from '@/components/ui';
import CalendarSelect from '@/components/ui/CalendarSelect';
import { patchFloidTransaction } from '@/services/budget/transactions/patch-floid-transaction';
import { getFloidTransaction, type FloidTransaction } from '@/services/budget/transactions/get-floid-transactions';
import { getManualTransaction, updateManualTransaction, ManualTransaction } from '@/services/budget/transactions/manual-transactions';
import { useAuth } from '@/providers/AuthProvider';
import { getUserCategories } from '@/services/budget/categories-manager';
import type { UserCategory } from '@/services/budget/categories-manager';
import Colors from '@/constants/Colors';
import { getTranslatedNames } from '@/utils/categoryTranslations';

// Unified transaction type for the form
interface UnifiedTransaction {
  id: number;
  description: string;
  date: string;
  amount: number;
  transaction_type: 'income' | 'outcome';
  bank: string;
  account_number: string;
  category?: {
    id: number;
    name: string;
  } | null;
  isManual: boolean;
}

export default function EditTransactionScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const params = useLocalSearchParams();

  const transactionId = params.id as string;
  const isManualParam = params.isManual === 'true';

  // Estados para la transaccion
  const [transaction, setTransaction] = useState<UnifiedTransaction | null>(null);
  const [transactionLoading, setTransactionLoading] = useState(true);

  // Estados del formulario
  const [description, setDescription] = useState('');
  const [selectedParentCategoryId, setSelectedParentCategoryId] = useState<string>('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('');
  const [date, setDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para categorias del API
  const [apiCategories, setApiCategories] = useState<UserCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Cargar transaccion desde la API
  useEffect(() => {
    const fetchTransaction = async () => {
      console.log('[EditTransaction] useEffect triggered', { accessToken: !!accessToken, transactionId, isManualParam });

      if (!accessToken || !transactionId) {
        console.log('[EditTransaction] Missing accessToken or transactionId');
        return;
      }

      try {
        setTransactionLoading(true);
        console.log('[EditTransaction] Fetching transaction with id:', transactionId, 'isManual:', isManualParam);

        let unifiedTransaction: UnifiedTransaction;

        if (isManualParam) {
          // Fetch manual transaction
          const response = await getManualTransaction(parseInt(transactionId), accessToken);
          const manualTx = response.data;

          const isIncome = manualTx.amount_in > 0;
          unifiedTransaction = {
            id: manualTx.id,
            description: manualTx.description,
            date: manualTx.date,
            amount: isIncome ? manualTx.amount_in : manualTx.amount_out,
            transaction_type: isIncome ? 'income' : 'outcome',
            bank: manualTx.bank_account?.bank_name || 'Cuenta manual',
            account_number: manualTx.bank_account?.account_number || '',
            category: manualTx.user_category ? {
              id: manualTx.user_category.id,
              name: manualTx.user_category.name
            } : null,
            isManual: true
          };
        } else {
          // Fetch Floid transaction
          const floidTx = await getFloidTransaction({ id: transactionId }, accessToken);

          if (!floidTx) {
            throw new Error('Transaccion no encontrada');
          }

          unifiedTransaction = {
            id: floidTx.id,
            description: floidTx.description || '',
            date: floidTx.date,
            amount: parseFloat(floidTx.amount?.toString() || '0'),
            transaction_type: floidTx.transaction_type,
            bank: floidTx.bank || '',
            account_number: floidTx.account_number || '',
            category: floidTx.category ? {
              id: floidTx.category.id,
              name: floidTx.category.name
            } : null,
            isManual: false
          };
        }

        console.log('[EditTransaction] Transaction data received:', unifiedTransaction);

        setTransaction(unifiedTransaction);
        setDescription(unifiedTransaction.description || '');

        // Formatear fecha
        if (unifiedTransaction.date) {
          const dateStr = unifiedTransaction.date.split('T')[0];
          const parts = dateStr.split('-');
          setDate(`${parts[2]}/${parts[1]}/${parts[0]}`);
        }

        console.log('[EditTransaction] State updated successfully');
      } catch (error) {
        console.error('[EditTransaction] Error fetching transaction:', error);
        setError('Error al cargar la transaccion');
      } finally {
        setTransactionLoading(false);
      }
    };

    fetchTransaction();
  }, [accessToken, transactionId, isManualParam]);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!accessToken) return;

      if (!transaction) return;

      try {
        setCategoriesLoading(true);

        const kind = transaction.transaction_type === 'income' ? 'income' : 'expense';
        const response = await getUserCategories({ kind, per_page: 100 }, accessToken);

        if (response?.success && response.data) {
          // Filtrar solo categorias padre
          const parentCategories = response.data.filter(cat => cat.parent_id === null);
          setApiCategories(parentCategories);

          // Pre-seleccionar categoria y subcategoria si existe
          if (transaction.category?.id) {
            const categoryIdStr = transaction.category.id.toString();

            // Buscar si es una categoria padre
            const parentCategory = parentCategories.find(cat => cat.id.toString() === categoryIdStr);
            if (parentCategory) {
              setSelectedParentCategoryId(categoryIdStr);
            } else {
              // Buscar si es una subcategoria
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
    const numAmount = transaction.amount;
    return Math.round(numAmount).toLocaleString('es-CL');
  }, [transaction]);

  // Opciones de categorias padre
  const categoryOptions = useMemo(() => {
    if (apiCategories.length === 0) return [];
    const isIncome = transaction?.transaction_type === 'income';
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
  }, [apiCategories, t, transaction?.transaction_type]);

  // Opciones de subcategorias basadas en la categoria seleccionada
  const subcategoryOptions = useMemo(() => {
    if (!selectedParentCategoryId || apiCategories.length === 0) return [];

    const selectedCategory = apiCategories.find(cat => cat && cat.id && cat.id.toString() === selectedParentCategoryId);
    if (!selectedCategory || !selectedCategory.children || selectedCategory.children.length === 0) return [];
    const isIncome = transaction?.transaction_type === 'income';
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
  }, [selectedParentCategoryId, apiCategories, t, transaction?.transaction_type]);

  const handleCategoryChange = (value: string) => {
    setSelectedParentCategoryId(value);
    setSelectedSubcategoryId(''); // Resetear subcategoria al cambiar categoria
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

    if (!transaction) return;

    try {
      setIsLoading(true);

      const dateParts = date.split('/');
      const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

      // Determinar category_id
      const categoryId = selectedSubcategoryId
        ? parseInt(selectedSubcategoryId)
        : selectedParentCategoryId
          ? parseInt(selectedParentCategoryId)
          : null;

      if (transaction.isManual) {
        // Update manual transaction
        await updateManualTransaction(
          transaction.id,
          {
            description: description.trim(),
            date: formattedDate,
            user_category_id: categoryId,
          },
          accessToken!
        );
      } else {
        // Update Floid transaction
        const transactionData: any = {
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

        await patchFloidTransaction({
          transactionId,
          transaction: transactionData
        }, accessToken!);
      }

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

  // Mostrar loading mientras carga la transaccion
  console.log('[EditTransaction] Render - transactionLoading:', transactionLoading, 'transaction:', !!transaction);

  if (transactionLoading || !transaction) {
    return (
      <Container variant="secondaryPage">
        <Header title={t('budget.transaction_edit', 'Editar transaccion')} showBackButton />
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
                    value={`${transaction.bank}${transaction.account_number ? ` - ${transaction.account_number}` : ''}`}
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
