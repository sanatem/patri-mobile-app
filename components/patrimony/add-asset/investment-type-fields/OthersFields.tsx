import React from 'react';
import { View, Text } from 'react-native';
import { Input, Select, Textarea } from '@/components/ui';
import Colors from '@/constants/Colors';

interface OthersFieldsProps {
  commercial_value: string;
  unit: string;
  name: string;
  description: string;
  comments: string;
  onInputChange: (field: string, value: string) => void;
  onSelectChange: (field: string, value: string) => void;
  onNumericInputChange: (field: string, value: string) => void;
  formatValue: (value: string) => string;
}

const UNIT_OPTIONS = [
  { label: 'CLP', value: 'clp' },
  { label: 'USD', value: 'usd' },
  { label: 'UF', value: 'uf' },
];

export default function OthersFields({
  commercial_value,
  unit,
  name,
  description,
  comments,
  onInputChange,
  onSelectChange,
  onNumericInputChange,
  formatValue
}: OthersFieldsProps) {
  return (
    <>
      <View>
        <Text className='text-base font-medium'
          style={{
            color: Colors.primary[500],
            marginBottom: 8,
          }}
        >
          ¿Cuál es el valor actual?
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
        <Textarea
          label="Comentarios"
          placeholder="Tus comentarios aquí"
          value={comments}
          onChangeText={(value) => onInputChange('comments', value)}
          autoCapitalize="sentences"
          numberOfLines={4}
          showCharacterCount
          maxLength={500}
        />
      </View>
    </>
  );
}
