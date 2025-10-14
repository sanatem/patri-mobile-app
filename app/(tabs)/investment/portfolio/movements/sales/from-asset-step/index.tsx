import React, { useMemo, useEffect, useRef } from 'react';
import { View } from 'react-native';
import FormLayout from '@/components/ui/FormLayout';
import { useTranslation } from 'react-i18next';
import AssetSelectionList from '@/components/investment/portfolio/AssetSelectionList';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { usePortfolioDetails } from '@/hooks/investment/usePortfolioDetails';
import { useFormatValue } from '@/hooks/common/useFormatValue';
import { useKeyboardHandler } from '@/hooks/common/useKeyboardHandler';

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
  const { formatValue, cleanNumericValue } = useFormatValue();
  const { metaDetails, loading: portfolioLoading } = usePortfolioDetails({ goalId });
  const { dismissKeyboard } = useKeyboardHandler();
  const inputRef = useRef(null);

  const assetData = useMemo(() => {
    if (!metaDetails) {
      return {
        totalAvailable: 0,
        portfolioOptions: [],
        individualFunds: [],
        brokerPortfoliosCount: 0,
        minimumProportionalAmount: 0,
        maximumProportionalAmount: 0,
        fundMinimums: {},
        fundMaximums: {}
      };
    }

    const totalAvailable = metaDetails.assets?.reduce((sum: number, asset) =>
      sum + (asset.value || 0), 0) || 0;

    const brokerPortfoliosCount = metaDetails.assets?.length || 0;

    const minimumProportionalAmount = metaDetails.assets?.reduce((sum: number, asset) =>
      sum + (asset.quotaValue || 0), 0) || 0;

    const maximumProportionalAmount = metaDetails.assets?.reduce((sum: number, asset) =>
      sum + (asset.value || 0), 0) || 0;

    const fundMinimums: Record<string, number> = {};
    const fundMaximums: Record<string, number> = {};
    metaDetails.assets?.forEach((asset) => {
      fundMinimums[`fund-${asset.id}`] = asset.quotaValue || 0;
      fundMaximums[`fund-${asset.id}`] = asset.value || 0;
    });

    const portfolioOptions = [
      {
        id: 'all-portfolio',
        title: t('salesFlow.allPortfolio'),
        subtitle: '',
        description: '',
        value: totalAvailable
      },
      {
        id: 'proportional-withdrawal',
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
      additionalInfo: `${t('salesFlow.pricePerShare')}: ${formatValue(String(asset.quotaValue || 0))}`
    })) || [];

    return {
      totalAvailable,
      portfolioOptions,
      individualFunds,
      brokerPortfoliosCount,
      minimumProportionalAmount,
      maximumProportionalAmount,
      fundMinimums,
      fundMaximums
    };
  }, [metaDetails, t, formatValue]);

  useEffect(() => {
    if (activo === 'all-portfolio' && assetData.totalAvailable > 0) {
      setAssetAmount(assetData.totalAvailable.toString());
    } else if (activo && activo !== 'all-portfolio') {
      setAssetAmount('');
    }
  }, [activo, assetData.totalAvailable, setAssetAmount]);

  const requiresAmountInput = activo && activo !== 'all-portfolio';

  const getMinimumAmount = () => {
    if (activo === 'proportional-withdrawal') {
      return assetData.minimumProportionalAmount;
    }
    if (activo && activo.startsWith('fund-')) {
      return assetData.fundMinimums[activo] || 0;
    }
    return 0;
  };

  const getMaximumAmount = () => {
    if (activo === 'proportional-withdrawal') {
      return assetData.maximumProportionalAmount;
    }
    if (activo && activo.startsWith('fund-')) {
      return assetData.fundMaximums[activo] || 0;
    }
    return 0;
  };

  const minimumAmount = getMinimumAmount();
  const maximumAmount = getMaximumAmount();
  const currentAmount = parseFloat(assetAmount) || 0;

  const isNextDisabled = !activo ||
    (requiresAmountInput && (!assetAmount || currentAmount <= 0)) ||
    (requiresAmountInput && currentAmount < minimumAmount) ||
    (requiresAmountInput && currentAmount > maximumAmount) ||
    (requiresAmountInput && destino === 'bank-account' && (!assetBankAccount || loadingBankAccounts)) ||
    (activo === 'all-portfolio' && destino === 'bank-account' && (!assetBankAccount || loadingBankAccounts)) ||
    (activo === 'all-portfolio' && (!assetAmount || parseFloat(assetAmount) <= 0));

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
        <View style={{ marginTop: -10, marginBottom: 20 }}>
          <Input
            label={t('salesFlow.cashSale.amountLabel')}
            value={assetAmount ? formatValue(assetAmount) : ''}
            onChangeText={(value) => {
              const cleaned = cleanNumericValue(value);
              setAssetAmount(cleaned);
            }}
            onBlur={dismissKeyboard}
            placeholder="$0"
            keyboardType="numeric"
            className="mb-4"
            maxLength={18}
            error={
              currentAmount > 0 && currentAmount < minimumAmount
                ? `Monto mínimo: ${formatValue(minimumAmount.toString())}`
                : currentAmount > maximumAmount
                ? `Monto máximo: ${formatValue(maximumAmount.toString())}`
                : undefined
            }
          />

          {destino === 'bank-account' && (
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

      {activo === 'all-portfolio' && destino === 'bank-account' && (
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