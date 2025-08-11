import React from 'react';
import { View, Text } from 'react-native';
import { Input, Select } from '@/components/ui';
import Colors from '@/constants/Colors';

interface CrowdfundingFieldsProps {
  crowdfunding_institution: string;
  crowdfunding_credit_id: string;
  period_return_rate: string;
  due_date: string;
  commercial_value: string;
  unit: string;
  name: string;
  onInputChange: (field: string, value: string) => void;
  onSelectChange: (field: string, value: string) => void;
  onNumericInputChange: (field: string, value: string) => void;
  formatValue: (value: string) => string;
}

const INSTITUTION_OPTIONS = [
  { label: 'Cumplo', value: 'cumplo' },
  { label: 'Broota', value: 'broota' },
  { label: 'Fintual', value: 'fintual' },
  { label: 'Destácame', value: 'destacame' },
  { label: 'Otros', value: 'otros' },
];

const CREDIT_TYPE_OPTIONS = [
  { label: 'Hipotecario', value: 'hipotecario' },
  { label: 'Consumo', value: 'consumo' },
  { label: 'Comercial', value: 'comercial' },
  { label: 'Otro', value: 'otro' },
];

const UNIT_OPTIONS = [
  { label: 'CLP', value: 'clp' },
  { label: 'USD', value: 'usd' },
  { label: 'UF', value: 'uf' },
];

export default function CrowdfundingFields({
  crowdfunding_institution,
  crowdfunding_credit_id,
  period_return_rate,
  due_date,
  commercial_value,
  unit,
  name,
  onInputChange,
  onSelectChange,
  onNumericInputChange,
  formatValue
}: CrowdfundingFieldsProps) {
  return (
    <>
      <View>
        <Text className='text-base font-medium'
          style={{
            color: Colors.primary[500],
            marginBottom: 8,
          }}
        >
          ¿En qué institución está?
        </Text>
        <Select
          options={INSTITUTION_OPTIONS}
          value={crowdfunding_institution}
          onSelect={(value) => onSelectChange('crowdfunding_institution', value)}
          placeholder="Selecciona la institución"
        />
      </View>

      <View>
        <Text className='text-base font-medium'
          style={{
            color: Colors.primary[500],
            marginBottom: 8,
          }}
        >
          ¿Qué tipo de crédito es?
        </Text>
        <Select
          options={CREDIT_TYPE_OPTIONS}
          value={crowdfunding_credit_id}
          onSelect={(value) => onSelectChange('crowdfunding_credit_id', value)}
          placeholder="Selecciona tipo de crédito"
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
          ¿Cuánto fue la rentabilidad del período? (en %)
        </Text>
        <Input
          placeholder="0.0"
          value={period_return_rate}
          onChangeText={(value) => onInputChange('period_return_rate', value)}
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
          ¿Cuándo es su fecha de vencimiento?
        </Text>
        <Input
          placeholder="YYYY-MM-DD"
          value={due_date}
          onChangeText={(value) => onInputChange('due_date', value)}
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
          placeholder="Crowdfunding"
          value={name}
          onChangeText={(value) => onInputChange('name', value)}
          autoCapitalize="words"
        />
      </View>
    </>
  );
}
