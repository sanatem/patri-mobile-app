import { View, Text, TouchableOpacity, Alert, Clipboard } from 'react-native';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/Colors';
import { Copy } from 'lucide-react-native';

interface BankDataItem {
  label: string;
  value: string;
  copyable?: boolean;
}

interface BankDataDisplayProps {
  title?: string;
}

export function BankDataDisplay({ title }: BankDataDisplayProps) {
  const { t } = useTranslation();

  const bankData: BankDataItem[] = [
    {
      label: 'Nombre:',
      value: 'Vector',
      copyable: true,
    },
    {
      label: 'Rut:',
      value: '76513680-6',
      copyable: true,
    },
    {
      label: 'Banco:',
      value: t('sourceFunds.bankTransfer.bankName'),
      copyable: true,
    },
    {
      label: 'Tipo de cuenta:',
      value: 'Cuenta corriente',
      copyable: true,
    },
    {
      label: 'Número de cuenta:',
      value: '922995560',
      copyable: true,
    },
    {
      label: 'Moneda:',
      value: 'CLP',
      copyable: true,
    },
    {
      label: 'Correo electrónico:',
      value: 'aportes@vectorcapital.cl',
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
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        marginTop: 16,
      }}>
        <Text className="text-base font-medium" style={{ color: Colors.primary[700] }}>
          {title || t('sourceFunds.bankTransfer.dataTitle')}
        </Text>
        <TouchableOpacity
          onPress={copyAllData}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderColor: Colors.primary[500],
            borderRadius: 12,
            backgroundColor: 'white',
          }}
          activeOpacity={0.7}
        >
          <Copy size={14} color={Colors.primary[500]} style={{ marginRight: 6 }} />
          <Text className="text-xs font-medium" style={{ color: Colors.primary[500] }}>
            {t('sourceFunds.bankTransfer.copyAll')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ gap: 8, marginBottom: 12 }}>
        {bankData.map((item, index) => (
          <View
            key={index}
            style={{
              backgroundColor: 'white',
              borderRadius: 16,
              paddingHorizontal: 10,
              paddingVertical: 8,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: Colors.gray[100],
            }}
          >
            <View style={{ flex: 1 }}>
              {item.label && (
                <Text className="text-sm font-medium mb-1" style={{ color: Colors.primary[500] }}>
                  {item.label}
                </Text>
              )}
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
    </View>
  );
}
