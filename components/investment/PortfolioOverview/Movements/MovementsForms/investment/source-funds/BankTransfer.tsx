import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation, Trans } from 'react-i18next';
import Colors from '@/constants/Colors';
import { BankDataDisplay } from './BankDataDisplay';

interface BankTransferProps {
  amount?: number;
}

export function BankTransfer({ amount }: BankTransferProps) {
  const { t } = useTranslation();

  return (
    <View>
      <View style={{ marginBottom: 12 }}>
        <Text className="text-sm font-regular mb-2" style={{ color: Colors.primary[700] }}>
          <Trans 
            i18nKey="sourceFunds.bankTransfer.instructions.line1"
            components={{
              1: <Text className="font-semibold" style={{ color: Colors.primary[700] }} />
            }}
          />
        </Text>
        <Text className="text-sm font-regular" style={{ color: Colors.primary[700] }}>
          {t('sourceFunds.bankTransfer.instructions.line2')}
        </Text>
      </View>
      
      <BankDataDisplay />
    </View>
  );
}
