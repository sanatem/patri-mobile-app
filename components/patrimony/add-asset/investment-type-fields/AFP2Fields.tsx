import React from 'react';
import { View, Text } from 'react-native';
import { Input, Select } from '@/components/ui';
import Colors from '@/constants/Colors';

interface AFP2FieldsProps {
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
  { label: 'AFP Capital', value: 'afp_capital' },
  { label: 'AFP Cuprum', value: 'afp_cuprum' },
  { label: 'AFP Habitat', value: 'afp_habitat' },
  { label: 'AFP Modelo', value: 'afp_modelo' },
  { label: 'AFP Planvital', value: 'afp_planvital' },
  { label: 'AFP Provida', value: 'afp_provida' },
  { label: 'AFP UNO', value: 'afp_uno' },
];

const FUND_OPTIONS = [
  { label: 'Fondo A', value: 'fondo_a' },
  { label: 'Fondo B', value: 'fondo_b' },
  { label: 'Fondo C', value: 'fondo_c' },
  { label: 'Fondo D', value: 'fondo_d' },
  { label: 'Fondo E', value: 'fondo_e' },
];

const TAX_REGIME_OPTIONS = [
  { label: 'Régimen General', value: 'regimen_general' },
  { label: 'Régimen Simplificado', value: 'regimen_simplificado' },
];

const UNIT_OPTIONS = [
  { label: 'CLP', value: 'clp' },
  { label: 'USD', value: 'usd' },
  { label: 'UF', value: 'uf' },
];

export default function AFP2Fields({
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
}: AFP2FieldsProps) {
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
          ¿A cuál régimen tributario están acogidos?
        </Text>
        <Select
          options={TAX_REGIME_OPTIONS}
          value={tax_regime}
          onSelect={(value) => onSelectChange('tax_regime', value)}
          placeholder="Selecciona un régimen"
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
          placeholder="Cuenta 2 AFP"
          value={name}
          onChangeText={(value) => onInputChange('name', value)}
          autoCapitalize="words"
        />
      </View>
    </>
  );
}
