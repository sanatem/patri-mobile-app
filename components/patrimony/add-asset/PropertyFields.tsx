import React from 'react';
import { View, Text } from 'react-native';
import { Input, RadioButton, Select } from '@/components/ui';
import Colors from '@/constants/Colors';

interface PropertyFieldsProps {
  location: string;
  square_mts: string;
  property_kind: string;
  commercial_value: string;
  unit: string;
  onInputChange: (field: string, value: string) => void;
  onSelectChange: (field: string, value: string) => void;
  onNumericInputChange: (field: string, value: string) => void;
  formatValue: (value: string) => string;
}

const PROPERTY_OWNERSHIP_OPTIONS = [
  { label: 'Sí', value: 'own' },
  { label: 'No', value: 'rent' },
];

const UNIT_OPTIONS = [
  { label: 'CLP', value: 'clp' },
  { label: 'USD', value: 'usd' },
  { label: 'UF', value: 'uf' },
];

export default function PropertyFields({ 
  location, 
  square_mts, 
  property_kind,
  commercial_value,
  unit,
  onInputChange, 
  onSelectChange,
  onNumericInputChange,
  formatValue
}: PropertyFieldsProps) {
  return (
    <>
      <View>
        <Text className='text-base font-medium'
          style={{
            color: Colors.primary[500],
            marginBottom: 8,
          }}
        >
          Ubicación
        </Text>
        <Input
          placeholder="Ej: Providencia, Santiago"
          value={location}
          onChangeText={(value) => onInputChange('location', value)}
          autoCapitalize="words"
        />
      </View>

      <View>
        <Text className='text-base font-medium'
          style={{
            color: Colors.primary[500],
            marginBottom: 8,
          }}
        >
          Metros cuadrados
        </Text>
        <Input
          placeholder="Ej: 105"
          value={square_mts}
          onChangeText={(value) => onInputChange('square_mts', value)}
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
          ¿Eres el propietario?
        </Text>
        <RadioButton
          options={PROPERTY_OWNERSHIP_OPTIONS}
          selectedValue={property_kind}
          onSelect={(value) => onSelectChange('property_kind', value)}
        />
      </View>

      <View>
        <Text className='text-base font-medium'
          style={{
            color: Colors.primary[500],
            marginBottom: 8,
          }}
        >
          ¿Qué valor tiene?
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
               placeholder="$150.000.000"
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