import React from 'react';
import FormLayout from '@/components/ui/FormLayout';
import { Select } from '@/components/ui/Select';
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

export default function FromAssetStep({ 
  activo, 
  setActivo, 
  destino, 
  cuenta, 
  setCuenta, 
  onNext, 
  onPrev, 
  mockActivos, 
  mockCuentas 
}: FromAssetStepProps) {
  const { t } = useTranslation();

  return (
    <FormLayout
      title={t('salesFlow.fromAssetStep.title')}
      subtitle={t('salesFlow.fromAssetStep.subtitle')}
      currentStep={2}
      totalSteps={3}
      onNext={onNext}
      onPrevious={onPrev}
      nextButtonTitle={t('salesFlow.next')}
      previousButtonTitle={t('salesFlow.previous')}
      isNextDisabled={!activo || (destino === 'cuenta-bancaria' && !cuenta)}
      showLogo={false}
    >
      <Select
        label={t('fromAssetStep.assetQuestion.part2')}
        options={mockActivos}
        value={activo}
        onSelect={setActivo}
        placeholder={t('fromAssetStep.assetPlaceholder')}
      />

      {destino === 'cuenta-bancaria' && (
        <Select
          label={t('fromAssetStep.accountQuestion.part2')}
          options={mockCuentas}
          value={cuenta}
          onSelect={setCuenta}
          placeholder={t('fromAssetStep.accountPlaceholder')}
        />
      )}
    </FormLayout>
  );
}