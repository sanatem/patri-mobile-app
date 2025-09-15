import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FormLayout from '@/components/ui/FormLayout';
import { Select } from '@/components/ui/Select';
import { BankTransfer, CheckDeposit, FintocTransfer } from '@/components/investment/source-funds';
import { useTranslation } from 'react-i18next';
import { useFormatValue } from '@/hooks/common/useFormatValue';
import Colors from '@/constants/Colors';

interface SourceFundsStepProps {
  selectedSource?: string;
  onSourceSelect?: (source: string) => void;
  onContinue?: () => void;
  onPrevious?: () => void;
  onConfirm?: (source: string) => void;
  amount: number;
  availableCashAmount: number;
  loading?: boolean;
}

function SourceFundsStep({
  selectedSource = '',
  onSourceSelect,
  onContinue,
  onPrevious,
  onConfirm,
  amount,
  availableCashAmount,
  loading = false,
}: SourceFundsStepProps) {
  const [selectedOption, setSelectedOption] = useState(selectedSource);
  const { t } = useTranslation();
  const { formatValue } = useFormatValue();

  const sourceOptions = useMemo(() => {
    const options = [
      {
        label: t('sourceFunds.options.fintoc'),
        value: 'fintoc',
      },
      {
        label: t('sourceFunds.options.bank'),
        value: 'bank',
      },
      {
        label: t('sourceFunds.options.check'),
        value: 'check',
      },
    ];

    if (amount > 0 && amount <= availableCashAmount) {
      options.push({
        label: t('sourceFunds.options.cash', { amount: formatValue(availableCashAmount.toString()) }),
        value: 'cash',
      });
    }

    return options;
  }, [amount, availableCashAmount, formatValue, t]);

  const handleOptionSelect = (value: string) => {
    setSelectedOption(value);
    if (onSourceSelect) {
      onSourceSelect(value);
    }
  };

  const handleContinue = () => {
    if ((selectedOption === 'bank' || selectedOption === 'check' || selectedOption === 'cash') && onConfirm) {
      onConfirm(selectedOption);
    } else if (selectedOption === 'fintoc' && onConfirm) {
      onConfirm(selectedOption);
    } else if (onContinue) {
      onContinue();
    }
  };

  const handlePrevious = () => {
    if (onPrevious) {
      onPrevious();
    }
  };

  return (
    <FormLayout
      title={t('sourceFunds.title')}
      subtitle={t('sourceFunds.subtitle')}
      currentStep={2}
      totalSteps={2}
      onNext={handleContinue}
      onPrevious={handlePrevious}
      nextButtonTitle={t('common.finish')}
      previousButtonTitle={t('common.back')}
      isNextDisabled={!selectedOption || loading}
      isLoading={loading}
      showLogo={false}
    >
      <Select
        options={sourceOptions}
        value={selectedOption || ''}
        onSelect={handleOptionSelect}
        placeholder={t('sourceFunds.placeholder')}
      />

      {selectedOption === 'bank' && (
        <BankTransfer amount={amount} />
      )}
      
      
      {selectedOption === 'check' && (
        <CheckDeposit amount={amount} />
      )}
      
      {selectedOption === 'cash' && (
        <View style={{ marginTop: 2 }}>
          <View style={{ padding: 2, backgroundColor: 'white'}}>
            <Text className="text-sm font-regular mb-2" style={{ color: Colors.primary[600] }}>
              {t('sourceFunds.cashTransfer.description')}
            </Text>
            <Text className="text-sm font-medium" style={{ color: Colors.primary[600] }}>
              {t('sourceFunds.cashTransfer.availableBalance', { amount: formatValue(availableCashAmount.toString()) })}
            </Text>
          </View>
          
        </View>
      )}
    </FormLayout>
  );
}

export default SourceFundsStep;
