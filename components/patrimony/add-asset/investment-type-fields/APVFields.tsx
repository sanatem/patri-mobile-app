import React from 'react';
import { View, Text } from 'react-native';
import { Input, Select } from '@/components/ui';
import Colors from '@/constants/Colors';

interface APVFieldsProps {
  institution: string;
  commercial_value: string;
  unit: string;
  fund1: string;
  fund1_percentage: string;
  fund2: string;
  fund2_percentage: string;
  tax_regime: string;
  name: string;
  onInputChange: (field: string, value: string) => void;
  onSelectChange: (field: string, value: string) => void;
  onNumericInputChange: (field: string, value: string) => void;
  formatValue: (value: string) => string;
}

const INSTITUTION_OPTIONS = [
  { label: 'Cuprum', value: '1' },
  { label: 'Habitat', value: '2' },
  { label: 'PlanVital', value: '3' },
  { label: 'ProVida', value: '4' },
  { label: 'Capital', value: '5' },
  { label: 'Modelo', value: '6' },
  { label: 'Uno', value: '7' },
];

const FUND_OPTIONS = [
  { label: 'Fondo A', value: 'fondo_a' },
  { label: 'Fondo B', value: 'fondo_b' },
  { label: 'Fondo C', value: 'fondo_c' },
  { label: 'Fondo D', value: 'fondo_d' },
  { label: 'Fondo E', value: 'fondo_e' },
];

const TAX_REGIME_OPTIONS = [
  { label: 'Régimen A', value: 'regimen_a' },
  { label: 'Régimen B', value: 'regimen_b' },
];

const UNIT_OPTIONS = [
  { label: 'CLP', value: 'clp' },
  { label: 'USD', value: 'usd' },
  { label: 'UF', value: 'uf' },
];

export default function APVFields({
  institution,
  commercial_value,
  unit,
  fund1,
  fund1_percentage,
  fund2,
  fund2_percentage,
  tax_regime,
  name,
  onInputChange,
  onSelectChange,
  onNumericInputChange,
  formatValue
}: APVFieldsProps) {
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
          value={institution}
          onSelect={(value) => onSelectChange('institution', value)}
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
          ¿En qué fondo lo tienes?
        </Text>
        <Text className='text-sm text-gray-500 mb-2'>
          Puedes elegir hasta 2
        </Text>
        
        <View className="flex-row mb-2">
          <View style={{ flex: 1, marginRight: 8 }}>
            <Select
              options={FUND_OPTIONS}
              value={fund1}
              onSelect={(value) => onSelectChange('fund1', value)}
              placeholder="Selecciona el fondo"
            />
          </View>
          <View style={{ width: 100 }}>
            <Input
              placeholder="0%"
              value={fund1_percentage}
              onChangeText={(value) => onInputChange('fund1_percentage', value)}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View className="flex-row">
          <View style={{ flex: 1, marginRight: 8 }}>
            <Select
              options={FUND_OPTIONS}
              value={fund2}
              onSelect={(value) => onSelectChange('fund2', value)}
              placeholder="Selecciona el fondo"
            />
          </View>
          <View style={{ width: 100 }}>
            <Input
              placeholder="0%"
              value={fund2_percentage}
              onChangeText={(value) => onInputChange('fund2_percentage', value)}
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
          ¿A qué régimen tributario corresponde?
        </Text>
        <Select
          options={TAX_REGIME_OPTIONS}
          value={tax_regime}
          onSelect={(value) => onSelectChange('tax_regime', value)}
          placeholder="Selecciona un régimen"
        />
      </View>  
    </>
  );
}
