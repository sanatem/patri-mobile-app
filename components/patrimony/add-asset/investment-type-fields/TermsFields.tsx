import React from 'react';
import { View, Text } from 'react-native';
import { Input, Select } from '@/components/ui';
import Colors from '@/constants/Colors';

interface TermsFieldsProps {
  bank: string;
  commercial_value: string;
  unit: string;
  name: string;
  deposit_type: string;
  opening_date: string;
  maturity_date: string;
  onInputChange: (field: string, value: string) => void;
  onSelectChange: (field: string, value: string) => void;
  onNumericInputChange: (field: string, value: string) => void;
  formatValue: (value: string) => string;
}

const BANK_OPTIONS = [
  { label: 'Banco de Chile', value: 'banco_chile' },
  { label: 'Banco Santander', value: 'banco_santander' },
  { label: 'Banco BCI', value: 'banco_bci' },
  { label: 'Banco Estado', value: 'banco_estado' },
  { label: 'Banco Falabella', value: 'banco_falabella' },
  { label: 'Banco Ripley', value: 'banco_ripley' },
  { label: 'Banco Consorcio', value: 'banco_consorcio' },
  { label: 'Banco Security', value: 'banco_security' },
  { label: 'Banco Itaú', value: 'banco_itau' },
  { label: 'Banco Scotiabank', value: 'banco_scotiabank' },
  { label: 'Otros', value: 'otros' },
];

const DEPOSIT_TYPE_OPTIONS = [
  { label: 'Depósito a plazo fijo', value: 'plazo_fijo' },
  { label: 'Depósito a plazo renovable', value: 'plazo_renovable' },
  { label: 'Depósito a plazo con retiro anticipado', value: 'plazo_retiro_anticipado' },
  { label: 'Otros', value: 'otros' },
];

const UNIT_OPTIONS = [
  { label: 'CLP', value: 'clp' },
  { label: 'USD', value: 'usd' },
  { label: 'UF', value: 'uf' },
];

export default function TermsFields({
  bank,
  commercial_value,
  unit,
  name,
  deposit_type,
  opening_date,
  maturity_date,
  onInputChange,
  onSelectChange,
  onNumericInputChange,
  formatValue
}: TermsFieldsProps) {
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

      <View>
        <Text className='text-base font-medium'
          style={{
            color: Colors.primary[500],
            marginBottom: 8,
          }}
        >
          ¿Qué tipo de depósito es?
        </Text>
        <Select
          options={DEPOSIT_TYPE_OPTIONS}
          value={deposit_type}
          onSelect={(value) => onSelectChange('deposit_type', value)}
          placeholder="Seleccione el tipo"
        />
      </View>

      <View>
        <Text className='text-base font-medium'
          style={{
            color: Colors.primary[500],
            marginBottom: 8,
          }}
        >
          ¿Cuándo fue la fecha de apertura?
        </Text>
        <Input
          placeholder="dd-mm-aaaa"
          value={opening_date}
          onChangeText={(value) => onInputChange('opening_date', value)}
          keyboardType="numeric"
        />
      </View>

      <View>
        <Text className='text-base font-medium'
          style={{
            color: Colors.primary[500],
            marginBottom: 8,
          }}
        >
          ¿Cuándo es la fecha de vencimiento?
        </Text>
        <Input
          placeholder="dd-mm-aaaa"
          value={maturity_date}
          onChangeText={(value) => onInputChange('maturity_date', value)}
          keyboardType="numeric"
        />
      </View>

      <View>
        <Text className='text-base font-medium'
          style={{
            color: Colors.primary[500],
            marginBottom: 8,
          }}
        >
          ¿Cuál es su nombre?
        </Text>
        <Text className='text-sm text-gray-500 mb-2'>
          Dale un nombre descriptivo para reconocerlo
        </Text>
        <Input
          placeholder="Depósito a Plazo"
          value={name}
          onChangeText={(value) => onInputChange('name', value)}
          autoCapitalize="words"
        />
      </View>
    </>
  );
}
