import React, { useMemo } from 'react';
import { View } from 'react-native';
import FormLayout from '@/components/ui/FormLayout';
import { useTranslation } from 'react-i18next';
import AssetSelectionList from '@/components/investment/portfolio/AssetSelectionList';
import CashSaleForm from '@/components/investment/movements/sales/CashSaleForm';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { usePortfolioDetails } from '@/hooks/investment/usePortfolioDetails';
import { useFormatValue } from '@/hooks/common/useFormatValue';

interface FromAssetStepProps {
  activo: string | undefined;
  setActivo: (v: string) => void;
  destino: string | undefined;
  cuenta: string | undefined;
  setCuenta: (v: string) => void;
  assetAmount: string;
  setAssetAmount: (v: string) => void;
  assetBankAccount: string | undefined;
  setAssetBankAccount: (v: string) => void;
  bankAccounts: { label: string; value: string }[];
  loadingBankAccounts?: boolean;
  onNext: () => void;
  onPrev: () => void;
  goalId: string;
  activos: { label: string; value: string }[];
  cuentas: { label: string; value: string }[];
}

export default function FromAssetStep({
  activo,
  setActivo,
  destino,
  cuenta,
  setCuenta,
  assetAmount,
  setAssetAmount,
  assetBankAccount,
  setAssetBankAccount,
  bankAccounts,
  loadingBankAccounts = false,
  onNext,
  onPrev,
  goalId,
  activos,
  cuentas
}: FromAssetStepProps) {
  const { t } = useTranslation();
  const { formatValue } = useFormatValue();
  const { metaDetails, loading: portfolioLoading } = usePortfolioDetails({ goalId });

  const assetData = useMemo(() => {
    if (!metaDetails) {
      return {
        totalAvailable: 0,
        portfolioOptions: [],
        individualFunds: [],
        brokerPortfoliosCount: 0
      };
    }

    const totalAvailable = metaDetails.assets?.reduce((sum: number, asset) =>
      sum + (asset.value || 0), 0) || 0;

    const brokerPortfoliosCount = metaDetails.assets?.length || 0;

    const portfolioOptions = [
      {
        id: 'portfolio-completo',
        title: t('salesFlow.allPortfolio'),
        subtitle: '',
        description: '',
        value: totalAvailable
      },
      {
        id: 'retiro-proporcional',
        title: t('salesFlow.proportionalWithdrawal'),
        subtitle: '',
        description: t('salesFlow.maintainStructure'),
        value: 0
      }
    ];

    const individualFunds = metaDetails.assets?.map((asset) => ({
      id: `fund-${asset.id}`,
      title: asset.title || 'Fondo',
      subtitle: asset.subtitle || '',
      description: `${t('salesFlow.availableShares')}: ${asset.availableQuotas || 0}`,
      value: asset.value || 0,
      additionalInfo: `${t('salesFlow.pricePerShare')}: ${formatValue(asset.quotaValue?.toString() || '0')}`
    })) || [];

    return {
      totalAvailable,
      portfolioOptions,
      individualFunds,
      brokerPortfoliosCount
    };
  }, [metaDetails, t, formatValue]);

  const requiresAmountInput = activo && activo !== 'portfolio-completo';
  const isNextDisabled = !activo ||
    (requiresAmountInput && (!assetAmount || parseFloat(assetAmount) <= 0)) ||
    (requiresAmountInput && destino === 'cuenta-bancaria' && (!assetBankAccount || loadingBankAccounts)) ||
    (activo === 'portfolio-completo' && destino === 'cuenta-bancaria' && (!assetBankAccount || loadingBankAccounts));

  return (
    <FormLayout
      title={t('salesFlow.fromAssetStep.title')}
      subtitle=''
      currentStep={2}
      totalSteps={3}
      onNext={onNext}
      onPrevious={onPrev}
      nextButtonTitle={t('salesFlow.next')}
      previousButtonTitle={t('salesFlow.previous')}
      isNextDisabled={isNextDisabled || false}
      showLogo={false}
    >
      <AssetSelectionList
        selectedAsset={activo}
        onAssetSelect={setActivo}
        totalAvailable={assetData.totalAvailable}
        portfolioOptions={assetData.portfolioOptions}
        individualFunds={assetData.individualFunds}
        brokerPortfoliosCount={assetData.brokerPortfoliosCount}
        loading={portfolioLoading}
      />

      {requiresAmountInput && (
        <View style={{ marginTop: -10}}>
          <Input
            label={t('salesFlow.cashSale.amountLabel')}
            value={assetAmount ? formatValue(assetAmount) : ''}
            onChangeText={(value) => {
              const cleaned = value.replace(/[^\d]/g, '');
              setAssetAmount(cleaned);
            }}
            placeholder="$0"
            keyboardType="numeric"
            className="mb-4"
          />

          {destino === 'cuenta-bancaria' && (
            <Select
              label={t('salesFlow.cashSale.bankAccountLabel')}
              options={bankAccounts}
              value={assetBankAccount}
              onSelect={setAssetBankAccount}
              placeholder={t('salesFlow.cashSale.bankAccountPlaceholder')}
            />
          )}
        </View>
      )}

      {activo === 'portfolio-completo' && destino === 'cuenta-bancaria' && (
        <View style={{ marginTop: -10}}>
          <Select
            label={t('salesFlow.cashSale.bankAccountLabel')}
            options={bankAccounts}
            value={assetBankAccount}
            onSelect={setAssetBankAccount}
            placeholder={t('salesFlow.cashSale.bankAccountPlaceholder')}
          />
        </View>
      )}
    </FormLayout>
  );
}