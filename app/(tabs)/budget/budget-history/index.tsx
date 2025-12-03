import React, { useState, useCallback } from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Container, KeyboardAwareContainer, LoadingSpinner, Card, Header, ConfirmModal } from '@/components/ui';
import { ChevronLeft, ChevronRight, Edit3, Trash2, CheckCircle, AlertTriangle } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';
import { getBudgetInstances } from '@/services/budget/budget-instances';
import { deactivateBudgetTemplate } from '@/services/budget/budget-templates';
import type { BudgetInstance } from '@/services/budget/budget-templates/types';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
};

const getStatusColor = (percentage: number, overBudget: boolean) => {
  if (overBudget || percentage >= 100) return Colors.error[500];
  if (percentage >= 80) return Colors.warning[500];
  return Colors.success[500];
};

export default function BudgetHistoryScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const { templateId, categoryId, categoryName } = useLocalSearchParams<{
    templateId: string;
    categoryId: string;
    categoryName: string;
  }>();

  const [historyInstances, setHistoryInstances] = useState<BudgetInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch history from API
  useFocusEffect(
    useCallback(() => {
      const fetchHistory = async () => {
        if (!accessToken || !categoryId) {
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          setError(null);

          const response = await getBudgetInstances(
            {
              user_category_id: parseInt(categoryId),
              limit: 12,
            },
            accessToken
          );

          if (response.success && response.budget_instances) {
            setHistoryInstances(response.budget_instances);
          } else {
            setHistoryInstances([]);
          }
        } catch (err) {
          console.error('Error fetching budget history:', err);
          setError(t('budget.error_loading_history', 'Error al cargar el historial'));
          setHistoryInstances([]);
        } finally {
          setLoading(false);
        }
      };

      fetchHistory();
    }, [accessToken, categoryId, t])
  );

  const handleNavigateToDetail = (instanceId: number) => {
    router.push({
      pathname: '/(tabs)/budget/budget-detail' as any,
      params: { instanceId: instanceId.toString() },
    });
  };

  const handleDeactivate = async () => {
    if (!accessToken || !templateId) return;

    try {
      setIsDeleting(true);
      await deactivateBudgetTemplate(parseInt(templateId), accessToken);
      setShowDeleteModal(false);
      router.back();
    } catch (err) {
      console.error('Error deactivating budget:', err);
    } finally {
      setIsDeleting(false);
    }
  };

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
        title={t('budget.history', 'Historial')}
        subtitle={categoryName || ''}
        leftAction={
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full justify-center items-center"
          >
            <ChevronLeft size={24} color={Colors.primary[500]} />
          </TouchableOpacity>
        }
        rightAction={
          <TouchableOpacity onPress={() => setShowDeleteModal(true)}>
            <Trash2 size={22} color={Colors.error[500]} />
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

            {historyInstances.length === 0 && !error ? (
              <Card variant="default" size="md" className="mb-4">
                <View className="py-8 items-center">
                  <Text className="text-gray-500 text-center">
                    {t('budget.no_history', 'No hay historial disponible')}
                  </Text>
                </View>
              </Card>
            ) : (
              historyInstances.map((instance) => {
                const percentageNum = typeof instance.percentage === 'string'
                  ? parseFloat(instance.percentage)
                  : instance.percentage;
                const statusColor = getStatusColor(percentageNum, instance.over_budget);
                const progressWidth = Math.min(percentageNum, 100);

                return (
                  <TouchableOpacity
                    key={instance.id}
                    onPress={() => handleNavigateToDetail(instance.id)}
                    activeOpacity={0.7}
                  >
                    <Card variant="elevated" size="md" className="mb-3">
                      <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-sm font-semibold text-gray-800">
                          {instance.period}
                        </Text>
                        <View className="flex-row items-center">
                          {instance.over_budget ? (
                            <AlertTriangle size={16} color={Colors.error[500]} />
                          ) : (
                            <CheckCircle size={16} color={Colors.success[500]} />
                          )}
                          <ChevronRight size={18} color={Colors.gray[400]} className="ml-1" />
                        </View>
                      </View>

                      <View className="mb-2">
                        <View className="flex-row justify-between mb-1">
                          <Text className="text-xs text-gray-500">
                            {t('budget.spent', 'Gastado')}: {formatCurrency(instance.spent)} / {formatCurrency(instance.amount)}
                          </Text>
                          <Text className="text-xs font-medium" style={{ color: statusColor }}>
                            {percentageNum.toFixed(0)}%
                          </Text>
                        </View>

                        {/* Progress Bar */}
                        <View
                          style={{
                            height: 6,
                            backgroundColor: Colors.gray[100],
                            borderRadius: 3,
                            overflow: 'hidden',
                          }}
                        >
                          <View
                            style={{
                              height: '100%',
                              width: `${progressWidth}%`,
                              backgroundColor: statusColor,
                              borderRadius: 3,
                            }}
                          />
                        </View>
                      </View>

                      <Text
                        className="text-xs"
                        style={{ color: instance.over_budget ? Colors.error[500] : Colors.gray[600] }}
                      >
                        {instance.over_budget
                          ? `${t('budget.exceeded_by', 'Excedido por')} ${formatCurrency(instance.remaining)}`
                          : `${t('budget.saved', 'Ahorraste')} ${formatCurrency(instance.remaining)}`}
                      </Text>
                    </Card>
                  </TouchableOpacity>
                );
              })
            )}
          </Container>

          <View className="h-24" />
        </ScrollView>
      </KeyboardAwareContainer>

      <ConfirmModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeactivate}
        title={t('budget.deactivate_budget', 'Desactivar Presupuesto')}
        message={t(
          'budget.deactivate_budget_message',
          '¿Estás seguro que deseas desactivar este presupuesto? Ya no se generarán nuevas instancias.'
        )}
        confirmButtonText={t('common.deactivate', 'Desactivar')}
        cancelButtonText={t('common.cancel', 'Cancelar')}
        isDeleting={isDeleting}
      />
    </Container>
  );
}
