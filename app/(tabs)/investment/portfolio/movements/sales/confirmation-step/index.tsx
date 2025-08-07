import React from 'react';
import { View, Text } from 'react-native';
import { Button } from '@/components/ui/Button';
import { PortfolioActionsBar } from '@/components/investment/portfolio/PortfolioActionsBar';
import { Container } from '@/components/ui/Container';
import Colors from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { useTranslation } from 'react-i18next';

interface ConfirmationStepProps {
  activo: string | undefined;
  mockActivos: { label: string; value: string }[];
  destino: string | undefined;
  onPrev: () => void;
  onFinish: () => void;
}

export default function ConfirmationStep({ activo, mockActivos, destino, onPrev, onFinish }: ConfirmationStepProps) {
  const { t } = useTranslation();

  return (
    <Container variant="secondaryPage" className="px-3">
      <Text className="text-base font-regular mb-2" style={{ color: Colors.primary[500] }}>
        {t('confirmationStep.title')}
      </Text>

      <Card className="bg-gray-50 rounded-xl p-4 mb-4">
        <Text className="text-sm font-regular mb-1" style={{ color: Colors.primary[500] }}>
          {t('confirmationStep.origin')}
        </Text>
        <Text className="text-base font-semibold mb-2" style={{ color: Colors.primary[500] }}>
          {activo ? mockActivos.find(a => a.value === activo)?.label : ''}
        </Text>

        <Text className="text-sm font-regular mb-1" style={{ color: Colors.primary[500] }}>
          {t('confirmationStep.amount')}
        </Text>
        <Text className="text-base font-semibold mb-2" style={{ color: Colors.primary[500] }}>
          $1.492.500,00 CLP
        </Text>

        <Text className="text-sm font-regular mb-1" style={{ color: Colors.primary[500] }}>
          {t('confirmationStep.destination')}
        </Text>
        <Text className="text-base font-semibold mb-2" style={{ color: Colors.primary[500] }}>
          {destino === 'cuenta-bancaria'
            ? t('confirmationStep.bankAccount')
            : t('confirmationStep.wallet')}
        </Text>
      </Card>

      <Text className="text-xs text-gray-500 mb-4">
        {t('confirmationStep.note')}
      </Text>
    </Container>
  );
} 