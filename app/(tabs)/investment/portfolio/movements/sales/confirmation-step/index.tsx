import React from 'react';
import { View, Text } from 'react-native';
import FormLayout from '@/components/ui/FormLayout';
import { Card } from '@/components/ui/Card';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

interface ConfirmationStepProps {
  activo: string | undefined;
  mockActivos: { label: string; value: string }[];
  destino: string | undefined;
  onPrev: () => void;
  onFinish: () => void;
}

export default function ConfirmationStep({ 
  activo, 
  mockActivos, 
  destino, 
  onPrev, 
  onFinish 
}: ConfirmationStepProps) {
  const { t } = useTranslation();

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
            {activo ? mockActivos.find(a => a.value === activo)?.label : ''}
          </Text>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-regular mb-1" style={{ color: Colors.primary[500] }}>
            {t('confirmationStep.amount')}
          </Text>
          <Text className="text-base font-semibold" style={{ color: Colors.primary[700] }}>
            $1.492.500,00 CLP
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