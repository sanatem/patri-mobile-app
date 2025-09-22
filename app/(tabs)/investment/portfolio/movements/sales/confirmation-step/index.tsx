import React from 'react';
import { View, Text } from 'react-native';
import FormLayout from '@/components/ui/FormLayout';
import { Card } from '@/components/ui/Card';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import CashSaleForm from '@/components/investment/movements/sales/CashSaleForm';
import AssetSelectionList from '@/components/investment/portfolio/AssetSelectionList';

interface ConfirmationStepProps {
  activo: string | undefined;
  activos: { label: string; value: string }[];
  destino: string | undefined;
  goal: string | undefined;
  cashAmount: string;
  setCashAmount: (value: string) => void;
  cashBankAccount: string | undefined;
  setCashBankAccount: (value: string) => void;
  bankAccounts: { label: string; value: string }[];
  onPrev: () => void;
  onFinish: () => void;
}

export default function ConfirmationStep({
  activo,
  activos,
  destino,
  goal,
  cashAmount,
  setCashAmount,
  cashBankAccount,
  setCashBankAccount,
  bankAccounts,
  onPrev,
  onFinish
}: ConfirmationStepProps) {
  const { t } = useTranslation();

  // Show cash form when cash-balance is selected
  if (goal === 'cash-balance') {
    return (
      <FormLayout
        title={t('salesFlow.confirmationStep.title')}
        subtitle={t('salesFlow.confirmationStep.subtitle')}
        currentStep={3}
        totalSteps={3}
        onNext={onFinish}
        onPrevious={onPrev}
        nextButtonTitle={t('salesFlow.finish')}
        previousButtonTitle={t('salesFlow.previous')}
        isNextDisabled={!cashAmount || !cashBankAccount}
        showLogo={false}
      >
        <CashSaleForm
          amount={cashAmount}
          setAmount={setCashAmount}
          bankAccount={cashBankAccount}
          setBankAccount={setCashBankAccount}
          bankAccounts={bankAccounts}
        />

        <Text className="text-xs font-regular mt-4" style={{ color: Colors.gray[500] }}>
          {t('confirmationStep.note')}
        </Text>
      </FormLayout>
    );
  }

  // Show confirmation for regular asset sales
  return (
    <FormLayout
      title={t('salesFlow.confirmationStep.title')}
      subtitle={t('salesFlow.confirmationStep.subtitle')}
      currentStep={3}
      totalSteps={3}
      onNext={onFinish}
      onPrevious={onPrev}
      nextButtonTitle={t('salesFlow.finish')}
      previousButtonTitle={t('salesFlow.previous')}
      showLogo={false}
    >
      <Card className="bg-gray-50 rounded-xl p-4">
        <View className="mb-4">
          <Text className="text-sm font-regular mb-1" style={{ color: Colors.primary[500] }}>
            {t('confirmationStep.origin')}
          </Text>
          <Text className="text-base font-semibold" style={{ color: Colors.primary[700] }}>
            {activo ? activos.find(a => a.value === activo)?.label : ''}
          </Text>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-regular mb-1" style={{ color: Colors.primary[500] }}>
            {t('confirmationStep.amount')}
          </Text>
          <Text className="text-base font-semibold" style={{ color: Colors.primary[700] }}>
            -
          </Text>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-regular mb-1" style={{ color: Colors.primary[500] }}>
            {t('confirmationStep.destination')}
          </Text>
          <Text className="text-base font-semibold" style={{ color: Colors.primary[700] }}>
            {destino === 'cuenta-bancaria'
              ? t('confirmationStep.bankAccount')
              : t('confirmationStep.wallet')}
          </Text>
        </View>
      </Card>

      <Text className="text-xs font-regular mt-4" style={{ color: Colors.gray[500] }}>
        {t('confirmationStep.note')}
      </Text>
    </FormLayout>
  );
} 