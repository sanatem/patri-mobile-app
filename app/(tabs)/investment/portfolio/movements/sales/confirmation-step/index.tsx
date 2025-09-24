
import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import FormLayout from '@/components/ui/FormLayout';
import { Card } from '@/components/ui/Card';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { useFormatValue } from '@/hooks/common/useFormatValue';
import { createSaleService } from '@/services/investment/portfolio/movements/create-sale';
import { useAuth } from '@/providers/AuthProvider';
import { useGoals } from '@/hooks/investment/useGoals';

interface ConfirmationStepProps {
  activo: string | undefined;
  activos: { label: string; value: string }[];
  destino: string | undefined;
  goal: string | undefined;
  goalOptions: { label: string; value: string }[];
  assetAmount: string;
  assetBankAccount: string | undefined;
  cashAmount: string;
  setCashAmount: (value: string) => void;
  cashBankAccount: string | undefined;
  setCashBankAccount: (value: string) => void;
  bankAccounts: { label: string; value: string }[];
  assetSections: any[];
  onPrev: () => void;
  onFinish: () => void;
}

export default function ConfirmationStep({
  activo,
  activos,
  destino,
  goal,
  goalOptions,
  assetAmount,
  assetBankAccount,
  cashAmount,
  setCashAmount,
  cashBankAccount,
  setCashBankAccount,
  bankAccounts,
  assetSections,
  onPrev,
  onFinish
}: ConfirmationStepProps) {
  const { t } = useTranslation();
  const { formatValue } = useFormatValue();
  const { accessToken, user } = useAuth();
  const { goals } = useGoals();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinish = async () => {
    if (!accessToken || !user) {
      Alert.alert('Error', 'No hay sesión activa');
      return;
    }

    setIsSubmitting(true);

    try {
      const amount = goal === 'cash-balance'
        ? parseFloat(cashAmount.replace(/[^0-9]/g, '')) || 0
        : parseFloat(assetAmount.replace(/[^0-9]/g, '')) || 0;

      if (amount <= 0) {
        Alert.alert('Error', 'El monto debe ser mayor a 0');
        return;
      }

      const accountInfo = goals.investment.accountInfo || goals.savings.accountInfo;
      if (!accountInfo) {
        Alert.alert('Error', 'No se encontró información de la cuenta de inversión');
        return;
      }

      const bankAccountId = goal === 'cash-balance'
        ? parseInt(cashBankAccount || '0')
        : parseInt(assetBankAccount || '0');

      const saleData = {
        movement: {
          type: 'retirement' as const,
          amount: amount,
          ...(goal === 'cash-balance'
            ? { goal: 'cash_balance' }
            : { goal_id: parseInt(goal || '0') }
          ),
          investment_account_id: accountInfo.id,
          destination: goal === 'cash-balance' ? 'bank' : destino === 'cuenta-bancaria' ? 'bank' : 'cash',
          bank_account_id: destino === 'cuenta-bancaria' || goal === 'cash-balance' ? bankAccountId : undefined
        }
      };

      const result = await createSaleService.createSale(saleData, accessToken);

      // Para web, navegar directamente. Para móvil, mostrar alert
      if (typeof window !== 'undefined') {
        // Estamos en web
        onFinish();
      } else {
        // Estamos en móvil
        Alert.alert(
          'Éxito',
          'El retiro ha sido creado exitosamente',
          [{
            text: 'OK',
            onPress: () => {
              try {
                onFinish();
              } catch (error) {
                console.error('Navigation error:', error);
              }
            }
          }]
        );
      }

    } catch (error) {
      console.error('Error creating sale:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Ocurrió un error al crear el retiro'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getOriginName = () => {
    if (goal === 'cash-balance') {
      return t('salesFlow.cashBalance');
    }

    if (activo === 'portfolio-completo') {
      return t('salesFlow.allPortfolio');
    }

    if (activo === 'retiro-proporcional') {
      return t('salesFlow.proportionalWithdrawal');
    }

    const selectedAsset = activos.find(a => a.value === activo);

    if (!selectedAsset && activo && activo.startsWith('fund-')) {
      const fundId = activo.replace('fund-', '');
      for (const section of assetSections) {
        const fund = section.assets.find((asset: any) => asset.id.toString() === fundId);
        if (fund) {
          return fund.title;
        }
      }
    }

    return selectedAsset?.label || 'No seleccionado';
  };

  if (goal === 'cash-balance') {
    const selectedBankAccount = bankAccounts.find(account => account.value === cashBankAccount);

    return (
      <FormLayout
        title={t('salesFlow.confirmationStep.title')}
        subtitle={t('salesFlow.confirmationStep.subtitle')}
        currentStep={3}
        totalSteps={3}
        onNext={handleFinish}
        onPrevious={onPrev}
        nextButtonTitle={t('salesFlow.finish')}
        previousButtonTitle={t('salesFlow.previous')}
        isNextDisabled={isSubmitting}
        showLogo={false}
      >
        <Card className="bg-gray-50 rounded-xl p-4">
          <View className="mb-4">
            <Text className="text-sm font-regular mb-1" style={{ color: Colors.primary[500] }}>
              {t('confirmationStep.origin')}
            </Text>
            <Text className="text-base font-semibold" style={{ color: Colors.primary[700] }}>
              {getOriginName()}
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-regular mb-1" style={{ color: Colors.primary[500] }}>
              {t('confirmationStep.amount')}
            </Text>
            <Text className="text-base font-semibold" style={{ color: Colors.primary[700] }}>
              {cashAmount ? formatValue(cashAmount) : '$0'}
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-regular mb-1" style={{ color: Colors.primary[500] }}>
              {t('confirmationStep.destination')}
            </Text>
            <Text className="text-base font-semibold" style={{ color: Colors.primary[700] }}>
              {selectedBankAccount?.label || t('confirmationStep.bankAccount')}
            </Text>
          </View>
        </Card>

        <Text className="text-base font-regular mt-4" style={{ color: Colors.gray[500] }}>
          {t('salesFlow.confirmationStep.finalNote')}
        </Text>
      </FormLayout>
    );
  }

  return (
    <FormLayout
      title={t('salesFlow.confirmationStep.title')}
      subtitle={t('salesFlow.confirmationStep.subtitle')}
      currentStep={3}
      totalSteps={3}
      onNext={handleFinish}
      onPrevious={onPrev}
      nextButtonTitle={t('salesFlow.finish')}
      previousButtonTitle={t('salesFlow.previous')}
      isNextDisabled={isSubmitting}
      showLogo={false}
    >
      <Card className="bg-gray-50 rounded-xl p-4">
        <View className="mb-4">
          <Text className="text-sm font-regular mb-1" style={{ color: Colors.primary[500] }}>
            {t('confirmationStep.origin')}
          </Text>
          <Text className="text-base font-semibold" style={{ color: Colors.primary[700] }}>
            {getOriginName()}
          </Text>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-regular mb-1" style={{ color: Colors.primary[500] }}>
            {t('confirmationStep.amount')}
          </Text>
          <Text className="text-base font-semibold" style={{ color: Colors.primary[700] }}>
            {assetAmount ? formatValue(assetAmount) : '$0'}
          </Text>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-regular mb-1" style={{ color: Colors.primary[500] }}>
            {t('confirmationStep.destination')}
          </Text>
          <Text className="text-base font-semibold" style={{ color: Colors.primary[700] }}>
            {destino === 'cuenta-bancaria'
              ? (bankAccounts.find(account => account.value === assetBankAccount)?.label || t('confirmationStep.bankAccount'))
              : t('confirmationStep.wallet')}
          </Text>
        </View>
      </Card>

      <Text className="text-sm font-regular mt-4" style={{ color: Colors.gray[500] }}>
        {t('salesFlow.confirmationStep.finalNote')}
      </Text>
    </FormLayout>
  );
} 