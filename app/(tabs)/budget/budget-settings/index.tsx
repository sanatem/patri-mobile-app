import React, { useState, useCallback } from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  Container,
  KeyboardAwareContainer,
  LoadingSpinner,
  Card,
  Header,
  ConfirmModal,
  FloatingActionButton,
  type FloatingAction,
} from '@/components/ui';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  History,
  Power,
  Settings,
} from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';
import { getBudgetTemplates, deactivateBudgetTemplate } from '@/services/budget/budget-templates';
import type { BudgetTemplate } from '@/services/budget/budget-templates/types';
import { getTranslatedNames } from '@/services/budget/utils/category-utils';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getRecurrenceLabel = (recurrence: string, t: any): string => {
  switch (recurrence) {
    case 'monthly':
      return t('budget.monthly', 'Mensual');
    case 'weekly':
      return t('budget.weekly', 'Semanal');
    case 'yearly':
      return t('budget.yearly', 'Anual');
    default:
      return recurrence;
  }
};

export default function BudgetSettingsScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { accessToken } = useAuth();
  const currentLang = i18n.language as 'en' | 'es' | 'es-CL';

  const [templates, setTemplates] = useState<BudgetTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [selectedTemplate, setSelectedTemplate] = useState<BudgetTemplate | null>(null);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  // Fetch templates
  useFocusEffect(
    useCallback(() => {
      const fetchTemplates = async () => {
        if (!accessToken) {
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          setError(null);

          const response = await getBudgetTemplates(accessToken);
          if (response.success && response.budget_templates) {
            setTemplates(response.budget_templates);
          } else {
            setTemplates([]);
          }
        } catch (err) {
          console.error('Error fetching templates:', err);
          setError(t('budget.error_loading_templates', 'Error al cargar los presupuestos'));
        } finally {
          setLoading(false);
        }
      };

      fetchTemplates();
    }, [accessToken, t])
  );

  const handleNavigateToCreate = () => {
    router.push('/(tabs)/budget/create-budget' as any);
  };

  const handleNavigateToHistory = (template: BudgetTemplate) => {
    router.push({
      pathname: '/(tabs)/budget/budget-history' as any,
      params: {
        templateId: template.id.toString(),
        categoryId: template.user_category.id.toString(),
        categoryName: template.user_category.name,
      },
    });
  };

  const handleDeactivatePress = (template: BudgetTemplate) => {
    setSelectedTemplate(template);
    setShowDeactivateModal(true);
  };

  const handleConfirmDeactivate = async () => {
    if (!selectedTemplate || !accessToken) return;

    try {
      setIsDeactivating(true);
      await deactivateBudgetTemplate(selectedTemplate.id, accessToken);

      // Remove from local state
      setTemplates((prev) => prev.filter((t) => t.id !== selectedTemplate.id));

      setShowDeactivateModal(false);
      setSelectedTemplate(null);
    } catch (err) {
      console.error('Error deactivating template:', err);
    } finally {
      setIsDeactivating(false);
    }
  };

  const floatingActions: FloatingAction[] = [
    {
      label: t('budget.new_budget', 'Nuevo Presupuesto'),
      icon: <Plus size={20} color={Colors.primary[500]} />,
      onPress: handleNavigateToCreate,
    },
  ];

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <Container variant="secondaryPage">
      <Header
        title={t('budget.budget_settings', 'Configurar Presupuestos')}
        leftAction={
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full justify-center items-center"
          >
            <ChevronLeft size={24} color={Colors.primary[500]} />
          </TouchableOpacity>
        }
      />

      <KeyboardAwareContainer>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <Container variant="content" className="py-4">
            {error && (
              <Card variant="default" size="md" className="mb-4">
                <Text className="text-center font-regular text-red-500">{error}</Text>
              </Card>
            )}

            {templates.length === 0 && !error ? (
              <View className="flex-1 justify-center items-center py-8">
                <View className="w-16 h-16 rounded-full bg-gray-100 justify-center items-center mb-4">
                  <Settings size={32} color={Colors.gray[400]} />
                </View>
                <Text className="text-center font-medium" style={{ color: Colors.gray[400] }}>
                  {t('budget.no_templates', 'No tienes presupuestos configurados')}
                </Text>
              </View>
            ) : (
              templates.map((template) => {
                const isIncome = template.user_category?.kind === 'income';
                const translatedNames = template.user_category?.name 
                  ? getTranslatedNames(template.user_category.name, isIncome)
                  : null;
                const categoryName = translatedNames?.[currentLang] || translatedNames?.es || template.user_category?.name || 'Sin categoría';
                
                return (
                <Card key={template.id} variant="outlined" size="md" className="mb-2">
                  {/* Header con iconos de acción */}
                  <View className="flex-row items-center">
                    <Text className="text-2xl mr-2">{template.user_category.emoji_code}</Text>
                    <View className="flex-1">
                      <Text className="text-base font-medium" style={{ color: Colors.primary[500] }}>
                        {categoryName}
                      </Text>
                      <Text className="text-sm font-regular" style={{ color: Colors.gray[500] }}>
                        {formatCurrency(template.amount)} / {getRecurrenceLabel(template.recurrence, t)}
                      </Text>
                    </View>
                    {/* Action Icons */}
                    <View className="flex-row items-center" style={{ gap: 12 }}>
                      <TouchableOpacity
                        onPress={() => handleNavigateToHistory(template)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <History size={20} color={Colors.primary[500]} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeactivatePress(template)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Power size={20} color={Colors.error[500]} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              );
              })
            )}
          </Container>

          <View className="h-32" />
        </ScrollView>
      </KeyboardAwareContainer>

      <FloatingActionButton actions={floatingActions} />

      {/* Deactivate Confirmation Modal */}
      <ConfirmModal
        visible={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        onConfirm={handleConfirmDeactivate}
        title={t('budget.deactivate_title', 'Desactivar presupuesto')}
        message={t(
          'budget.deactivate_message',
          '¿Estás seguro de que deseas desactivar este presupuesto? Ya no se generarán nuevas instancias.'
        )}
        confirmButtonText={t('budget.deactivate', 'Desactivar')}
        cancelButtonText={t('common.cancel', 'Cancelar')}
        isDeleting={isDeactivating}
      />
    </Container>
  );
}
