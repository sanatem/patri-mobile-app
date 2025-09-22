import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/Colors';
import { BankDataDisplay } from './BankDataDisplay';

interface CheckDepositProps {
  amount?: number;
}

export function CheckDeposit({ amount }: CheckDepositProps) {
  const { t } = useTranslation();

  return (
    <View style={{ marginTop: 2 }}>
      <BankDataDisplay />

      <View style={{ marginTop: 20, gap: 6 }}>
        <View style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 16,
        }}>
            <View style={{ flex: 1 }}>
              <Text className="text-sm font-medium mb-2" style={{ color: Colors.primary[700] }}>
                {t('sourceFunds.checkDeposit.voucher.title')}
              </Text>
              <Text className="text-sm font-regular" style={{ color: Colors.primary[600] }}>
                {t('sourceFunds.checkDeposit.voucher.description')}
            </Text>
          </View>
        </View>  
        <View style={{
          height: 1,
          backgroundColor: Colors.gray[50],
          marginHorizontal: 16,
        }} />
        
        <View style={{
          backgroundColor: 'white',
          padding: 16,
        }}>
            <View style={{ flex: 1 }}>
              <Text className="text-sm font-medium mb-2" style={{ color: Colors.primary[700] }}>
                {t('sourceFunds.checkDeposit.rutRequirement.title')}
              </Text>
              <Text className="text-sm font-regular" style={{ color: Colors.primary[600] }}>
                {t('sourceFunds.checkDeposit.rutRequirement.description')}
              </Text>
          </View>
        </View>
      </View>
    </View>
  );
}