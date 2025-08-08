import React from 'react';
import { View, Text } from 'react-native';
import { Input, Select } from '@/components/ui';
import Colors from '@/constants/Colors';

interface CrowdfundingFieldsProps {
  platform: string;
  commercial_value: string;
  unit: string;
  name: string;
  onInputChange: (field: string, value: string) => void;
  onSelectChange: (field: string, value: string) => void;
  onNumericInputChange: (field: string, value: string) => void;
  formatValue: (value: string) => string;
}

const PLATFORM_OPTIONS = [
  { label: 'Cumplo', value: 'cumplo' },
  { label: 'Broota', value: 'broota' },
  { label: 'Fintual', value: 'fintual' },
  { label: 'Destácame', value: 'destacame' },
  { label: 'Otros', value: 'otros' },
];

const UNIT_OPTIONS = [
  { label: 'CLP', value: 'clp' },
  { label: 'USD', value: 'usd' },
  { label: 'UF', value: 'uf' },
];

export default function CrowdfundingFields({
  platform,
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
          ¿En qué plataforma está?
        </Text>
        <Select
          options={PLATFORM_OPTIONS}
          value={platform}
          onSelect={(value) => onSelectChange('platform', value)}
          placeholder="Selecciona la plataforma"
        />
      </View>

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
