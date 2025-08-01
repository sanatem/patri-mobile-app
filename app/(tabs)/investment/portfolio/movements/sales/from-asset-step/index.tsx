import React from 'react';
import { View, Text } from 'react-native';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { PortfolioActionsBar } from '@/components/investment/portfolio/PortfolioActionsBar';
import { Container } from '@/components/ui/Container';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

interface FromAssetStepProps {
  activo: string | undefined;
  setActivo: (v: string) => void;
  destino: string | undefined;
  cuenta: string | undefined;
  setCuenta: (v: string) => void;
  onNext: () => void;
  onPrev: () => void;
  mockActivos: { label: string; value: string }[];
  mockCuentas: { label: string; value: string }[];
}

export default function FromAssetStep({ activo, setActivo, destino, cuenta, setCuenta, onNext, onPrev, mockActivos, mockCuentas }: FromAssetStepProps) {
  const { t } = useTranslation();

  return (
    <Container variant="secondaryPage" className="px-3">
      <Text className="text-base font-regular mb-2" style={{ color: Colors.primary[500] }}>
        {t('fromAssetStep.assetQuestion.part1')} <Text className="font-semibold">{t('fromAssetStep.assetQuestion.part2')}</Text> {t('fromAssetStep.assetQuestion.part3')}
      </Text>
      <Select
        options={mockActivos}
        value={activo}
        onSelect={setActivo}
        placeholder={t('fromAssetStep.assetPlaceholder')}
      />

      {destino === 'cuenta-bancaria' && (
        <>
          <Text className="text-base font-regular mb-2" style={{ color: Colors.primary[500] }}>
            {t('fromAssetStep.accountQuestion.part1')} <Text className="font-semibold">{t('fromAssetStep.accountQuestion.part2')}</Text> {t('fromAssetStep.accountQuestion.part3')}
          </Text>
          <Select
            options={mockCuentas}
            value={cuenta}
            onSelect={setCuenta}
            placeholder={t('fromAssetStep.accountPlaceholder')}
          />
        </>
      )}
    </Container>
  );
}