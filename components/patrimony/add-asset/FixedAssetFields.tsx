import React from 'react';
import { View, Text } from 'react-native';
import { Select, Input } from '@/components/ui';
import Colors from '@/constants/Colors';

interface FixedAssetFieldsProps {
  asset_category_id: string;
  commercial_value: string;
  unit: string;
  onSelectChange: (field: string, value: string) => void;
  onNumericInputChange: (field: string, value: string) => void;
  formatValue: (value: string) => string;
}

const ASSET_CATEGORY_OPTIONS = [
  { label: 'Auto o moto', value: '1' },
  { label: 'Terreno', value: '2' },
  { label: 'Otros', value: '3' },
];

const UNIT_OPTIONS = [
  { label: 'CLP', value: 'clp' },
  { label: 'USD', value: 'usd' },
  { label: 'UF', value: 'uf' },
];

export default function FixedAssetFields({ 
  asset_category_id, 
  commercial_value, 
  unit, 
  onSelectChange, 
  onNumericInputChange, 
  formatValue 
}: FixedAssetFieldsProps) {
  return (
    <>
      <View>
        <Select
          label="¿Qué activo tienes?"
          options={ASSET_CATEGORY_OPTIONS}
          value={asset_category_id}
          onSelect={(value) => onSelectChange('asset_category_id', value)}
          placeholder="Selecciona la categoría"
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