import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import { Card, ConfirmModal } from '@/components/ui';
import { ChevronRight, Settings, History, Edit3, Power, X, Circle } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import type { CombinedBudget, BudgetTemplate } from '@/services/budget/budget-templates/types';
import { getTranslatedNames } from '@/services/budget/utils/category-utils';

interface CombinedBudgetCardProps {
  budget: CombinedBudget;
  onPress?: () => void;
  onEditAmount?: (templateId: number, newAmount: number) => void;
  onDeactivate?: (templateId: number) => void;
  onViewHistory?: (template: BudgetTemplate) => void;
  isUpdating?: boolean;
  isDeactivating?: boolean;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
};

const getRecurrenceLabel = (recurrence: string): string => {
  switch (recurrence) {
    case 'monthly': return 'Mensual';
    case 'weekly': return 'Semanal';
    case 'yearly': return 'Anual';
    default: return recurrence;
  }
};

const getBudgetStatus = (percentage: number, overBudget: boolean) => {
  // 100%+: Red (exceeded)
  if (overBudget || percentage > 100) {
    return { color: Colors.red[500], bgColor: Colors.red[100], label: 'Excedido' };
  }
  // 81-100%: Orange
  if (percentage > 80) {
    return { color: Colors.orange[600], bgColor: Colors.orange[100], label: 'Alerta' };
  }
  // 61-80%: Yellow-orange
  if (percentage > 60) {
    return { color: Colors.orange[500], bgColor: Colors.orange[100], label: 'Alerta' };
  }
  // 41-60%: Yellow
  if (percentage > 40) {
    return { color: Colors.yellow[500], bgColor: Colors.yellow[100], label: 'Precaución' };
  }
  // 21-40%: Yellow-green (lime)
  if (percentage > 20) {
    return { color: Colors.lime[500], bgColor: Colors.lime[100], label: 'En control' };
  }
  // 0-20%: Green (success)
  return { color: Colors.success[500], bgColor: Colors.success[100], label: 'En control' };
};

export function CombinedBudgetCard({
  budget,
  onPress,
  onEditAmount,
  onDeactivate,
  onViewHistory,
  isUpdating = false,
  isDeactivating = false
}: CombinedBudgetCardProps) {
  const { t, i18n } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [newAmount, setNewAmount] = useState('');
  const { template, instance, hasProgress } = budget;

  // Datos de la categoría desde el template
  const categoryEmoji = template.user_category?.emoji_code || '📊';
  const isIncome = template.user_category?.kind === 'income';
  const translatedNames = template.user_category?.name 
    ? getTranslatedNames(template.user_category.name, isIncome)
    : null;
  const currentLang = i18n.language as 'en' | 'es' | 'es-CL';
  const categoryName = translatedNames?.[currentLang] || translatedNames?.es || template.user_category?.name || 'Sin categoría';

  // Si hay instance CON transacciones, calcular el progreso
  const hasTransactions = hasProgress && instance && instance.spent > 0;
  const percentageNum = hasTransactions
    ? (typeof instance.percentage === 'string' ? parseFloat(instance.percentage) : instance.percentage)
    : 0;
  const status = hasTransactions ? getBudgetStatus(percentageNum, instance?.over_budget || false) : null;
  const progressWidth = Math.min(percentageNum, 100);

  const handleCardPress = () => {
    if (hasTransactions && onPress) {
      onPress();
    }
  };

  const handleMenuOption = (action: 'edit' | 'history' | 'deactivate') => {
    setShowMenu(false);
    // Delay para evitar conflicto con el cierre del modal en móvil
    setTimeout(() => {
      switch (action) {
        case 'edit':
          setNewAmount(template.amount.toString());
          setShowEditModal(true);
          break;
        case 'history':
          onViewHistory?.(template);
          break;
        case 'deactivate':
          setShowDeactivateModal(true);
          break;
      }
    }, 300);
  };

  const handleConfirmDeactivate = () => {
    onDeactivate?.(template.id);
    setShowDeactivateModal(false);
  };

  const handleSaveAmount = () => {
    const amount = parseInt(newAmount.replace(/\D/g, ''), 10);
    if (amount > 0) {
      onEditAmount?.(template.id, amount);
      setShowEditModal(false);
      setNewAmount('');
    }
  };

  return (
    <>
      <Card variant="default" size="md" className="mb-2">
        {/* Header con categoría y botón gestionar */}
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity
            onPress={handleCardPress}
            activeOpacity={hasProgress ? 0.7 : 1}
            className="flex-row items-center flex-1"
          >
            <Text className="text-2xl mr-2">{categoryEmoji}</Text>
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-800" numberOfLines={1}>
                {categoryName}
              </Text>
              <Text className="text-xs text-gray-500">
                {getRecurrenceLabel(template.recurrence)} • {formatCurrency(template.amount)}
              </Text>
            </View>
          </TouchableOpacity>

          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => setShowMenu(true)}
              className="p-2 rounded-full"
              style={{ backgroundColor: Colors.gray[100] }}
            >
              <Settings size={18} color={Colors.gray[500]} />
            </TouchableOpacity>
            {hasTransactions && (
              <TouchableOpacity onPress={handleCardPress} className="ml-2">
                <ChevronRight size={20} color={Colors.gray[400]} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Contenido: progreso o mensaje sin transacciones */}
        {hasTransactions && instance ? (
          <>
            <View className="mb-3">
              <View className="flex-row justify-between mb-1">
                <Text className="text-sm text-gray-600">
                  {formatCurrency(instance.spent)} / {formatCurrency(instance.amount)}
                </Text>
                <Text className="text-sm font-medium" style={{ color: status?.color }}>
                  {percentageNum.toFixed(0)}%
                </Text>
              </View>

              {/* Progress Bar */}
              <View
                style={{
                  height: 8,
                  backgroundColor: Colors.gray[100],
                  borderRadius: 4,
                  overflow: 'hidden'
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: `${progressWidth}%`,
                    backgroundColor: status?.color,
                    borderRadius: 4,
                  }}
                />
              </View>
            </View>

          </>
        ) : (
          <View className="py-2">
            <View
              style={{
                height: 8,
                backgroundColor: Colors.gray[100],
                borderRadius: 4,
                overflow: 'hidden',
                marginBottom: 8
              }}
            >
              <View
                style={{
                  height: '100%',
                  width: '0%',
                  backgroundColor: Colors.gray[300],
                  borderRadius: 4,
                }}
              />
            </View>
            <Text className="text-sm font-regular text-center" style={{ color: Colors.gray[400] }}>
              {t('budget.no_transactions_this_month', 'Sin transacciones este mes')}
            </Text>
          </View>
        )}
      </Card>

      {/* Modal de menú de gestión */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <View className="bg-white rounded-t-3xl p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-gray-800">
                {t('budget.manage_budget', 'Gestionar presupuesto')}
              </Text>
              <TouchableOpacity onPress={() => setShowMenu(false)}>
                <X size={24} color={Colors.gray[500]} />
              </TouchableOpacity>
            </View>

            <Text className="text-sm text-gray-500 mb-4">
              {categoryEmoji} {categoryName}
            </Text>

            {/* Opción: Editar monto */}
            <TouchableOpacity
              onPress={() => handleMenuOption('edit')}
              disabled={isUpdating}
              className="flex-row items-center py-4 border-b border-gray-100"
              style={{ opacity: isUpdating ? 0.5 : 1 }}
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: Colors.primary[100] }}
              >
                <Edit3 size={20} color={Colors.primary[500]} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-800">
                  {t('budget.edit_amount', 'Editar monto')}
                </Text>
                <Text className="text-sm text-gray-500">
                  {t('budget.edit_amount_desc', 'Cambiar el monto del presupuesto')}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Opción: Ver historial */}
            <TouchableOpacity
              onPress={() => handleMenuOption('history')}
              className="flex-row items-center py-4 border-b border-gray-100"
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: Colors.primary[100] }}
              >
                <History size={20} color={Colors.primary[500]} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-800">
                  {t('budget.view_history', 'Ver historial')}
                </Text>
                <Text className="text-sm text-gray-500">
                  {t('budget.view_history_desc', 'Ver progreso de meses anteriores')}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Opción: Desactivar */}
            <TouchableOpacity
              onPress={() => handleMenuOption('deactivate')}
              disabled={isDeactivating}
              className="flex-row items-center py-4"
              style={{ opacity: isDeactivating ? 0.5 : 1 }}
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: Colors.red[100] }}
              >
                <Power size={20} color={Colors.red[500]} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium" style={{ color: Colors.red[500] }}>
                  {t('budget.deactivate', 'Desactivar')}
                </Text>
                <Text className="text-sm text-gray-500">
                  {t('budget.deactivate_desc', 'Dejar de usar este presupuesto')}
                </Text>
              </View>
            </TouchableOpacity>

            <View className="h-8" />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal de edición de monto */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowEditModal(false)}
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 mx-6"
            style={{ width: '85%' }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-gray-800">
                {t('budget.edit_amount', 'Editar monto')}
              </Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={24} color={Colors.gray[500]} />
              </TouchableOpacity>
            </View>

            <Text className="text-sm text-gray-500 mb-4">
              {categoryEmoji} {categoryName}
            </Text>

            <Text className="text-sm font-medium text-gray-700 mb-2">
              {t('budget.new_amount', 'Nuevo monto')}
            </Text>

            <TextInput
              value={newAmount}
              onChangeText={(text) => setNewAmount(text.replace(/\D/g, ''))}
              placeholder="0"
              keyboardType="numeric"
              className="border border-gray-200 rounded-xl px-4 py-3 text-lg mb-4"
              style={{
                backgroundColor: Colors.gray[50],
                color: Colors.gray[800]
              }}
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                className="flex-1 py-3 rounded-xl items-center"
                style={{ backgroundColor: Colors.gray[100] }}
              >
                <Text className="font-medium" style={{ color: Colors.gray[600] }}>
                  {t('common.cancel', 'Cancelar')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveAmount}
                disabled={isUpdating || !newAmount || parseInt(newAmount) <= 0}
                className="flex-1 py-3 rounded-xl items-center"
                style={{
                  backgroundColor: Colors.primary[500],
                  opacity: (isUpdating || !newAmount || parseInt(newAmount) <= 0) ? 0.5 : 1
                }}
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="font-medium text-white">
                    {t('common.save', 'Guardar')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Modal de confirmación para desactivar */}
      <ConfirmModal
        visible={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        onConfirm={handleConfirmDeactivate}
        title={t('budget.deactivate_title', 'Desactivar presupuesto')}
        message={t('budget.deactivate_message', '¿Estás seguro de que deseas desactivar este presupuesto?')}
        confirmButtonText={t('budget.deactivate', 'Desactivar')}
        cancelButtonText={t('common.cancel', 'Cancelar')}
        isDeleting={isDeactivating}
      />
    </>
  );
}
