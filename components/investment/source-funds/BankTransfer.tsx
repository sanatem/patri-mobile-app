import React from 'react';
import { View, Text, TouchableOpacity, Alert, Clipboard } from 'react-native';
import { useTranslation, Trans } from 'react-i18next';
import Colors from '@/constants/Colors';
import { Copy } from 'lucide-react-native';

interface BankDataItem {
  label: string;
  value: string;
  copyable?: boolean;
}

interface BankTransferProps {
  amount?: number;
}

export function BankTransfer({ amount }: BankTransferProps) {
  const { t } = useTranslation();

  const bankData: BankDataItem[] = [
    {
      label: t('sourceFunds.bankTransfer.fields.name'),
      value: 'Vector Capital Corredores de Bolsa',
      copyable: true,
    },
    {
      label: t('sourceFunds.bankTransfer.fields.rut'),
      value: '13345668-5',
      copyable: true,
    },
    {
      label: t('sourceFunds.bankTransfer.fields.accountNumber'),
      value: '11068350',
      copyable: true,
    },
    {
      label: t('sourceFunds.bankTransfer.fields.accountType'),
      value: t('sourceFunds.bankTransfer.values.accountType'),
      copyable: false,
    },
    {
      label: t('sourceFunds.bankTransfer.fields.currency'),
      value: t('sourceFunds.bankTransfer.values.currency'),
      copyable: false,
    },
    {
      label: t('sourceFunds.bankTransfer.fields.email'),
      value: 'user8@demo.com',
      copyable: true,
    },
  ];

  const copyToClipboard = (value: string, label: string) => {
    try {
      Clipboard.setString(value);
      Alert.alert(
        t('sourceFunds.bankTransfer.alerts.copied'),
        t('sourceFunds.bankTransfer.alerts.copiedField', { field: label })
      );
    } catch (error) {
      Alert.alert(
        t('sourceFunds.bankTransfer.alerts.error'),
        t('sourceFunds.bankTransfer.alerts.copyError')
      );
    }
  };

  const copyAllData = () => {
    try {
      const allData = bankData
        .map(item => `${item.label}: ${item.value}`)
        .join('\n');
      
      Clipboard.setString(allData);
      Alert.alert(
        t('sourceFunds.bankTransfer.alerts.copied'),
        t('sourceFunds.bankTransfer.alerts.copiedAll')
      );
    } catch (error) {
      Alert.alert(
        t('sourceFunds.bankTransfer.alerts.error'),
        t('sourceFunds.bankTransfer.alerts.copyError')
      );
    }
  };

  return (
    <View style={{ marginTop: 2 }}>
      <View style={{ marginBottom: 20 }}>
        <Text className="text-base font-regular mb-2" style={{ color: Colors.primary[700] }}>
          Haz la transferencia desde <Text className="font-semibold" style={{ color: Colors.primary[700] }}>una cuenta a tu nombre</Text>. 
        </Text>
        <Text className="text-base font-regular" style={{ color: Colors.primary[700] }}>
          Para identificar tu transferencia más rápido, recuerda incluir el correo electrónico indicado en la creación del destinatario.
        </Text>
      </View>

      <View style={{
        backgroundColor: Colors.gray[50],
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: Colors.primary[100],
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
              width: 40,
              height: 40,
              backgroundColor: Colors.primary[100],
              borderRadius: 8,
              marginRight: 12,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text className="text-lg font-bold" style={{ color: Colors.primary[600] }}>B</Text>
            </View>
            <Text className="text-lg font-semibold" style={{ color: Colors.primary[700] }}>
              Banco Security
            </Text>
          </View>
        </View>

        <View style={{ marginBottom: 16 }}>
          {bankData.map((item, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 12,
                borderBottomWidth: index < bankData.length - 1 ? 1 : 0,
                borderBottomColor: Colors.primary[100],
              }}
            >
              <View style={{ flex: 1 }}>
                <Text className="text-sm font-medium mb-1" style={{ color: Colors.primary[500] }}>
                  {item.label}
                </Text>
                <Text className="text-sm font-regular" style={{ color: Colors.primary[700] }}>
                  {item.value}
                </Text>
              </View>
              
              {item.copyable && (
                <TouchableOpacity
                  onPress={() => copyToClipboard(item.value, item.label)}
                  style={{
                    padding: 8,
                    marginLeft: 12,
                  }}
                  activeOpacity={0.7}
                >
                  <Copy size={18} color={Colors.primary[600]} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={copyAllData}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 12,
          }}
          activeOpacity={0.7}
        >
          <Copy size={16} color={Colors.primary[700]} style={{ marginRight: 8 }} />
          <Text className="text-sm font-medium" style={{ color: Colors.primary[700] }}>
            Copiar todo
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
