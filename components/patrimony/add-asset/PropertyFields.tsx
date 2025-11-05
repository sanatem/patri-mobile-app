import React from 'react';
import { View, Text } from 'react-native';
import { Input, RadioButton, Select } from '@/components/ui';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

interface PropertyFieldsProps {
  location: string;
  square_mts: string;
  property_kind: string;
  commercial_value: string;
  unit: string;
  isEditMode?: boolean;
  onInputChange: (field: string, value: string) => void;
  onSelectChange: (field: string, value: string) => void;
  onNumericInputChange: (field: string, value: string) => void;
  formatValue: (value: string) => string;
}


export default function PropertyFields({
  location,
  square_mts,
  property_kind,
  commercial_value,
  unit,
  isEditMode = false,
  onInputChange,
  onSelectChange,
  onNumericInputChange,
  formatValue
}: PropertyFieldsProps) {
  const { t } = useTranslation();
  const PROPERTY_OWNERSHIP_OPTIONS = [
    { label: t('propertyFields.ownershipOptions.own'), value: 'own' },
    { label: t('propertyFields.ownershipOptions.rent'), value: 'rent' },
  ];
  
  const UNIT_OPTIONS = [
    { label: t('propertyFields.unitOptions.clp'), value: 'clp' },
    { label: t('propertyFields.unitOptions.usd'), value: 'usd' },
    { label: t('propertyFields.unitOptions.uf'), value: 'uf' },
  ];
  return (
    <>
      <View>
        <Text className='text-base font-medium'
          style={{
            color: Colors.primary[500],
            marginBottom: 8,
          }}
        >
          {t('propertyFields.locationLabel')}
        </Text>
        <Input
          placeholder={t('propertyFields.locationPlaceholder')}
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
          {t('propertyFields.squareMetersLabel')}
        </Text>
        <Input
          placeholder={t('propertyFields.squareMetersPlaceholder')}
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
          {t('propertyFields.valueLabel')}
        </Text>
        <View className="flex-row">
          <View style={{ width: 100, marginRight: 8 }}>
            <Select
              options={UNIT_OPTIONS}
              value={unit}
              onSelect={(value) => onSelectChange('unit', value)}
              placeholder={t('propertyFields.unitPlaceholder')}
            />
          </View>
          <View style={{ flex: 1 }}>
             <Input
               placeholder={t('propertyFields.valuePlaceholder')}
               value={commercial_value ? formatValue(commercial_value) : ''}
               onChangeText={(value) => onNumericInputChange('commercial_value', value)}
               keyboardType="numeric"
             />
           </View>
        </View>
      </View>

      {!isEditMode && (
        <View>
          <Text className='text-base font-medium'
            style={{
              color: Colors.primary[500],
              marginBottom: 8,
            }}
          >
            {t('propertyFields.mainHomeLabel')}
          </Text>
          <RadioButton
            options={PROPERTY_OWNERSHIP_OPTIONS}
            selectedValue={property_kind}
            onSelect={(value) => onSelectChange('property_kind', value)}
          />
        </View>
      )}
    </>
  );
} 