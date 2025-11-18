import React, { useState, useCallback } from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Container, KeyboardAwareContainer, LoadingSpinner, Card, Header, ConfirmModal } from '@/components/ui';
import { ChevronLeft, Edit3, Trash2, CheckCircle, AlertTriangle } from 'lucide-react-native';
import Colors from '@/constants/Colors';

// Mock data for budget history - will be replaced with API call
const mockHistoryInstances = [
  {
    id: 10,
    budget_template_id: 1,
    start_date: '2024-11-01',
    end_date: '2024-11-30',
    amount: 500000,
    spent_amount: 130000,
    remaining_amount: 370000,
    percentage: 26,
    over_budget: false,
    period: 'Noviembre 2024'
  },
  {
    id: 9,
    budget_template_id: 1,
    start_date: '2024-10-01',
    end_date: '2024-10-31',
    amount: 500000,
    spent_amount: 480000,
    remaining_amount: 20000,
    percentage: 96,
    over_budget: false,
    period: 'Octubre 2024'
  },
  {
    id: 8,
    budget_template_id: 1,
    start_date: '2024-09-01',
    end_date: '2024-09-30',
    amount: 500000,
    spent_amount: 520000,
    remaining_amount: -20000,
    percentage: 104,
    over_budget: true,
    period: 'Septiembre 2024'
  },
  {
    id: 7,
    budget_template_id: 1,
    start_date: '2024-08-01',
    end_date: '2024-08-31',
    amount: 450000,
    spent_amount: 380000,
    remaining_amount: 70000,
    percentage: 84,
    over_budget: false,
    period: 'Agosto 2024'
  }
];

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
  const { instanceId, categoryName } = useLocalSearchParams<{ instanceId: string; categoryName: string }>();

  const [historyInstances, setHistoryInstances] = useState(mockHistoryInstances);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Effects - will fetch data from API when available
  useFocusEffect(
    useCallback(() => {
      const fetchHistory = async () => {
        try {
          setLoading(true);
          // TODO: Replace with actual API call
          // const response = await getBudgetInstances({ user_category_id: instanceId, limit: 12 }, accessToken);
          // setHistoryInstances(response.budget_instances);

          // Simulate loading
          setTimeout(() => {
            setLoading(false);
          }, 500);
        } catch (error) {
          console.error('Error fetching budget history:', error);
          setLoading(false);
        }
      };

      fetchHistory();
    }, [instanceId])
  );

  const handleEdit = () => {
    // TODO: Navigate to edit budget screen
    console.log('Edit budget:', instanceId);
  };

  const handleDeactivate = async () => {
    try {
      setIsDeleting(true);
      // TODO: Replace with actual API call
      // await deactivateBudgetTemplate(templateId, accessToken);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setShowDeleteModal(false);
      router.back();
    } catch (error) {
      console.error('Error deactivating budget:', error);
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
        title={categoryName || t('budget.history', 'Historial')}
        leftAction={
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full justify-center items-center"
          >
            <ChevronLeft size={24} color={Colors.primary[500]} />
          </TouchableOpacity>
        }
        rightAction={
          <View className="flex-row">
            <TouchableOpacity
              onPress={handleEdit}
              className="mr-2"
            >
              <Edit3 size={22} color={Colors.primary[500]} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowDeleteModal(true)}
            >
              <Trash2 size={22} color={Colors.error[500]} />
            </TouchableOpacity>
          </View>
        }
      />

      <KeyboardAwareContainer>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <Container variant="content" className="py-4">
            <Text className="text-sm font-medium text-gray-600 mb-4">
              {t('budget.budget_history_title', 'Historial de Presupuesto')}
            </Text>

            {historyInstances.map((instance, index) => {
              const statusColor = getStatusColor(instance.percentage, instance.over_budget);
              const progressWidth = Math.min(instance.percentage, 100);

              return (
                <Card key={instance.id} variant="elevated" size="md" className="mb-3">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm font-semibold text-gray-800">
                      {instance.period}
                    </Text>
                    {instance.over_budget ? (
                      <AlertTriangle size={16} color={Colors.error[500]} />
                    ) : (
                      <CheckCircle size={16} color={Colors.success[500]} />
                    )}
                  </View>

                  <View className="mb-2">
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-xs text-gray-500">
                        {t('budget.spent', 'Gastado')}: {formatCurrency(instance.spent_amount)} / {formatCurrency(instance.amount)}
                      </Text>
                      <Text className="text-xs font-medium" style={{ color: statusColor }}>
                        {instance.percentage.toFixed(0)}%
                      </Text>
                    </View>

                    {/* Progress Bar */}
                    <View
                      style={{
                        height: 6,
                        backgroundColor: Colors.gray[100],
                        borderRadius: 3,
                        overflow: 'hidden'
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

                  <Text className="text-xs" style={{ color: instance.over_budget ? Colors.error[500] : Colors.gray[600] }}>
                    {instance.over_budget
                      ? `${t('budget.exceeded_by', 'Excedido por')} ${formatCurrency(instance.remaining_amount)}`
                      : `${t('budget.saved', 'Ahorraste')} ${formatCurrency(instance.remaining_amount)}`
                    }
                  </Text>
                </Card>
              );
            })}
          </Container>

          <View className="h-24" />
        </ScrollView>
      </KeyboardAwareContainer>

      <ConfirmModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeactivate}
        title={t('budget.deactivate_budget', 'Desactivar Presupuesto')}
        message={t('budget.deactivate_budget_message', '¿Estás seguro que deseas desactivar este presupuesto? Ya no se generarán nuevas instancias.')}
        confirmButtonText={t('common.deactivate', 'Desactivar')}
        cancelButtonText={t('common.cancel', 'Cancelar')}
        isDeleting={isDeleting}
      />
    </Container>
  );
}
