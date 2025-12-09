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
} from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';
import { getBudgetTemplates, deactivateBudgetTemplate } from '@/services/budget/budget-templates';
import type { BudgetTemplate } from '@/services/budget/budget-templates/types';

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
  const { t } = useTranslation();
  const { accessToken } = useAuth();

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
                <Text className="text-center text-red-500">{error}</Text>
              </Card>
            )}

            <Text className="text-sm text-gray-500 mb-4">
              {t('budget.settings_description', 'Administra tus presupuestos activos. Puedes editar el monto, ver historial o desactivar.')}
            </Text>

            {templates.length === 0 && !error ? (
              <Card variant="default" size="md" className="mb-4">
                <View className="py-8 items-center">
                  <Text className="text-gray-500 text-center mb-4">
                    {t('budget.no_templates', 'No tienes presupuestos configurados')}
                  </Text>
                  <TouchableOpacity
                    onPress={handleNavigateToCreate}
                    className="px-4 py-2 rounded-lg"
                    style={{ backgroundColor: Colors.primary[500] }}
                  >
                    <Text className="text-white font-medium">
                      {t('budget.create_first', 'Crear primer presupuesto')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ) : (
              templates.map((template) => (
                <Card key={template.id} variant="elevated" size="md" className="mb-3">
                  {/* Header */}
                  <View className="flex-row items-center mb-3">
                    <Text className="text-2xl mr-2">{template.user_category.emoji_code}</Text>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-800">
                        {template.user_category.name}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {formatCurrency(template.amount)} / {getRecurrenceLabel(template.recurrence, t)}
                      </Text>
                    </View>
                    <View
                      className="px-2 py-1 rounded"
                      style={{ backgroundColor: Colors.success[100] }}
                    >
                      <Text className="text-xs font-medium" style={{ color: Colors.success[600] }}>
                        {t('budget.active', 'Activo')}
                      </Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View
                    className="flex-row pt-3"
                    style={{ borderTopWidth: 1, borderTopColor: Colors.gray[100] }}
                  >
                    <TouchableOpacity
                      onPress={() => handleNavigateToHistory(template)}
                      className="flex-1 flex-row items-center justify-center py-2"
                    >
                      <History size={16} color={Colors.primary[500]} />
                      <Text className="ml-1 text-sm font-medium" style={{ color: Colors.primary[500] }}>
                        {t('budget.history', 'Historial')}
                      </Text>
                    </TouchableOpacity>

                    <View style={{ width: 1, backgroundColor: Colors.gray[200] }} />

                    <TouchableOpacity
                      onPress={() => handleDeactivatePress(template)}
                      className="flex-1 flex-row items-center justify-center py-2"
                    >
                      <Power size={16} color={Colors.error[500]} />
                      <Text className="ml-1 text-sm font-medium" style={{ color: Colors.error[500] }}>
                        {t('budget.deactivate', 'Desactivar')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ))
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
