import React from 'react';
import { View, Text } from 'react-native';
import { Input, Select } from '@/components/ui';
import Colors from '@/constants/Colors';

interface CheckingAccountFieldsProps {
  bank: string;
  commercial_value: string;
  unit: string;
  name: string;
  onInputChange: (field: string, value: string) => void;
  onSelectChange: (field: string, value: string) => void;
  onNumericInputChange: (field: string, value: string) => void;
  formatValue: (value: string) => string;
}

const BANK_OPTIONS = [
  { label: 'Bice', value: '2' },
  { label: 'Chile-Edwards', value: '3' },
  { label: 'Banco de Crédito e Inversiones (BCI)', value: '4' },
  { label: 'Banco del Desarrollo', value: '5' },
  { label: 'Falabella', value: '6' },
  { label: 'Internacional', value: '7' },
  { label: 'Penta', value: '9' },
  { label: 'Santander', value: '10' },
  { label: 'Banco Security', value: '11' },
  { label: 'Banco Estado', value: '12' },
  { label: 'BBVA', value: '13' },
  { label: 'Citibank N.A. Chile', value: '14' },
  { label: 'Itau-Corpbanca', value: '15' },
  { label: 'Scotiabank', value: '16' },
  { label: 'Credichile', value: '17' },
  { label: 'Credit Suisse', value: '18' },
  { label: 'Deutsche Bank', value: '19' },
  { label: 'ING Bank', value: '20' },
  { label: 'Ripley', value: '21' },
  { label: 'Banco de Santiago', value: '22' },
  { label: 'TBanc', value: '23' },
  { label: 'Consorcio', value: '24' },
  { label: 'Copeuch', value: '25' },
  { label: 'Prepago Los Héroes', value: '26' },
  { label: 'Tenpo Prepago', value: '27' },
  { label: 'Mercado Pago', value: '28' },
  { label: 'TAPP Caja Los Andes', value: '29' },
];

const UNIT_OPTIONS = [
  { label: 'CLP', value: 'clp' },
  { label: 'USD', value: 'usd' },
  { label: 'UF', value: 'uf' },
];

export default function CheckingAccountFields({
  bank,
  commercial_value,
  unit,
  name,
  onInputChange,
  onSelectChange,
  onNumericInputChange,
  formatValue
}: CheckingAccountFieldsProps) {
  return (
    <>
      <View>
        <Text className='text-base font-medium'
          style={{
            color: Colors.primary[500],
            marginBottom: 8,
          }}
        >
          ¿En qué banco está?
        </Text>
        <Select
          options={BANK_OPTIONS}
          value={bank}
          onSelect={(value) => onSelectChange('bank', value)}
          placeholder="Selecciona banco"
        />
      </View>

      <View>
        <Text className='text-base font-medium'
          style={{
            color: Colors.primary[500],
            marginBottom: 8,
          }}
        >
          ¿Cuál es el saldo actual?
        </Text>
        <View className="flex-row">
          <View style={{ width: 100, marginRight: 8 }}>
            <Select
              options={UNIT_OPTIONS}
              value={unit}
              onSelect={(value) => onSelectChange('unit', value)}
              placeholder="Moneda"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              placeholder="$0"
              value={commercial_value ? formatValue(commercial_value) : ''}
              onChangeText={(value) => onNumericInputChange('commercial_value', value)}
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>
    </>
  );
}
