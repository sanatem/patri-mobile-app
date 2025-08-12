import React from 'react';
import { View, Text } from 'react-native';
import { Input, Select, CalendarSelect } from '@/components/ui';
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
  { label: 'Cumplo', value: '1' },
  { label: 'Becual', value: '2' },
  { label: 'Broota', value: '3' },
  { label: 'RedCapital', value: '4' },
];

const CREDIT_TYPE_OPTIONS = [
  { label: 'Crédito Amortizable', value: '1' },
  { label: 'Crédito Bullet', value: '2' },
  { label: 'Crédito Cero Cupón', value: '3' },
  { label: 'Crédito Factura', value: '4' },
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
          key={`cf-inst-${crowdfunding_institution}`}
          options={INSTITUTION_OPTIONS}
          value={(crowdfunding_institution ?? '').toString()}
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
          key={`cf-credit-${crowdfunding_credit_id}`}
          options={CREDIT_TYPE_OPTIONS}
          value={(crowdfunding_credit_id ?? '').toString()}
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
        <CalendarSelect
          label="¿Cuándo es su fecha de vencimiento?"
          placeholder="Selecciona la fecha de vencimiento"
          value={due_date}
          onSelect={(value) => onInputChange('due_date', value)}
        />
      </View>   
    </>
  );
}
