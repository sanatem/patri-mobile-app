import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Container, Header, Input, Select, Button, KeyboardAwareContainer } from '@/components/ui';
import CalendarSelect from '@/components/ui/CalendarSelect';
import { patchFloidTransaction } from '@/services/budget/patch-floid-transaction';
import { useAuth } from '@/providers/AuthProvider';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/constants/BudgetCategories';
import Colors from '@/constants/Colors';

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
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [date, setDate] = useState(() => {
    if (!initialDate) return '';
    const dateStr = initialDate.split('T')[0];
    const parts = dateStr.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = useMemo(() => {
    if (!initialAmount) return '';
    const numAmount = parseFloat(initialAmount);
    return Math.round(numAmount).toLocaleString('es-CL');
  }, [initialAmount]);

  const categoryOptions = useMemo(() => {
    const categories = transactionType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const currentLang = t('common.language_code', 'es');

    return [
      { label: t('budget.no_category', 'Sin categoría'), value: '' },
      ...categories.map(cat => ({
        label: `${cat.emoji} ${cat.name[currentLang as keyof typeof cat.name] || cat.name.es}`,
        value: cat.id
      }))
    ];
  }, [t, transactionType]);

  const subcategoryOptions = useMemo(() => {
    if (!category) return [];

    const categories = transactionType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const selectedCategory = categories.find(cat => cat.id === category);

    if (!selectedCategory || !selectedCategory.subcategories) return [];

    const currentLang = t('common.language_code', 'es');

    return [
      { label: t('budget.no_subcategory', 'Sin subcategoría'), value: '' },
      ...selectedCategory.subcategories.map(subcat => ({
        label: `${subcat.emoji} ${subcat.name[currentLang as keyof typeof subcat.name] || subcat.name.es}`,
        value: subcat.id
      }))
    ];
  }, [category, t, transactionType]);

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setSubcategory(''); // Resetear subcategoría al cambiar categoría
  };

  const handleSubmit = async () => {
    setError(null);

    if (!description.trim()) {
      setError(t('budget.transaction_description') + ' es requerida');
      return;
    }

    try {
      setIsLoading(true);

      const dateParts = date.split('/');
      const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

      const transactionData = {
        description: description.trim(),
        date: formattedDate,
        category: category || undefined,
        subcategory: subcategory || undefined
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
    return description.trim().length > 0;
  };

  return (
    <Container variant="secondaryPage">
      <Header
        title={transactionType === 'income' ? t('budget.income_singular') : t('budget.expense_singular')}
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
              {/* Monto en grande centrado */}
              <View style={{ alignItems: 'center', marginBottom: 24 }}>
                <Text
                  className="text-4xl font-semibold"
                  style={{
                    color: transactionType === 'income' ? Colors.success[600] : Colors.error[600]
                  }}
                >
                  {transactionType === 'income' ? '+' : '-'}${amount}
                </Text>
              </View>

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

                <Select
                  label={t('budget.category', 'Categoría')}
                  options={categoryOptions}
                  value={category}
                  onSelect={handleCategoryChange}
                  placeholder={t('budget.no_category', 'Sin categoría')}
                />

                {category && subcategoryOptions.length > 0 && (
                  <Select
                    label={t('budget.subcategory', 'Subcategoría')}
                    options={subcategoryOptions}
                    value={subcategory}
                    onSelect={setSubcategory}
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
            </View>
          </ScrollView>

          {/* Footer con botones fijos */}
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
