import React from 'react';
import { View, Text } from 'react-native';
import { Input, RadioButton, Select, LoadingSpinner } from '@/components/ui';
import Colors from '@/constants/Colors';
import { ApiProperty } from '@/types/api';
import { useTranslation } from 'react-i18next';
interface HypothecaryFieldsProps {
  propertyAssociated: string;
  propertyId: string;
  createProperty: string;
  propertyLocation: string;
  propertyCommercialValue: string;
  propertyUnit: string;
  propertySquareMts: string;
  properties: ApiProperty[];
  loadingProperties: boolean;
  onInputChange: (field: string, value: string) => void;
  onSelectChange: (field: string, value: string) => void;
  onNumericInputChange: (field: string, value: string) => void;
  formatValue: (value: string) => string;
}

export default function HypothecaryFields({
  propertyAssociated,
  propertyId,
  createProperty,
  propertyLocation,
  propertyCommercialValue,
  propertyUnit,
  propertySquareMts,
  properties,
  loadingProperties,
  onInputChange,
  onSelectChange,
  onNumericInputChange,
  formatValue
}: HypothecaryFieldsProps) {
  const { t } = useTranslation();
  const PROPERTY_ASSOCIATION_OPTIONS = [
    { label: t('hypothecaryFields.associationOptions.yes'), value: 'yes' },
    { label: t('hypothecaryFields.associationOptions.no'), value: 'no' },
  ];
  
  const CREATE_PROPERTY_OPTIONS = [
    { label: t('hypothecaryFields.createPropertyOptions.yes'), value: 'yes' },
    { label: t('hypothecaryFields.createPropertyOptions.no'), value: 'no' },
  ];
  
  const UNIT_OPTIONS = [
    { label: t('hypothecaryFields.unitOptions.clp'), value: 'clp' },
    { label: t('hypothecaryFields.unitOptions.usd'), value: 'usd' },
    { label: t('hypothecaryFields.unitOptions.uf'), value: 'uf' },
  ];
  return (
    <>
      <View>
        <RadioButton
          label={t('hypothecaryFields.associationLabel')}
          options={PROPERTY_ASSOCIATION_OPTIONS}
          selectedValue={propertyAssociated}
          onSelect={(value) => onSelectChange('property_associated', value)}
        />
      </View>

      {propertyAssociated === 'yes' && (
        <View>
          {loadingProperties ? (
            <View style={{ padding: 16, alignItems: 'center' }}>
              <LoadingSpinner size="small" />
              <Text style={{ marginTop: 8, color: Colors.gray[500] }}>
                {t('hypothecaryFields.loadingProperties')}
              </Text>
            </View>
          ) : (
            <Select
              label={t('hypothecaryFields.selectPropertyLabel')}
              options={properties.map(property => ({
                label: `${property.location} - $${property.commercial_value.toLocaleString('es-CL')}`,
                value: property.id.toString()
              }))}
              value={propertyId}
              onSelect={(value) => onSelectChange('property_id', value)}
              placeholder={t('hypothecaryFields.selectPropertyPlaceholder')}
            />
          )}
        </View>
      )}

      {propertyAssociated === 'no' && (
        <View>
          <RadioButton
            label={t('hypothecaryFields.createPropertyLabel')}
            options={CREATE_PROPERTY_OPTIONS}
            selectedValue={createProperty}
            onSelect={(value) => onSelectChange('create_property', value)}
          />
        </View>
      )}

      {propertyAssociated === 'no' && createProperty === 'yes' && (
        <>
          <View>
            <Text className='text-base font-medium'
              style={{
                color: Colors.primary[500],
                marginBottom: 8,
              }}
            >
              {t('hypothecaryFields.locationLabel')}
            </Text>
            <Input
              placeholder={t('hypothecaryFields.locationPlaceholder')}
              value={propertyLocation}
              onChangeText={(value) => onInputChange('property_location', value)}
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
              {t('hypothecaryFields.valueLabel')}
            </Text>
            <View className="flex-row">
              <View style={{ width: 100, marginRight: 8 }}>
                <Select
                  options={UNIT_OPTIONS}
                  value={propertyUnit}
                  onSelect={(value) => onSelectChange('property_unit', value)}
                  placeholder={t('hypothecaryFields.unitPlaceholder')}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  placeholder="$550.000.000"
                  value={propertyCommercialValue ? formatValue(propertyCommercialValue) : ''}
                  onChangeText={(value) => onNumericInputChange('property_commercial_value', value)}
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
              {t('hypothecaryFields.squareMetersLabel')}
            </Text>
            <Input
              placeholder={t('hypothecaryFields.squareMetersPlaceholder')}
              value={propertySquareMts}
              onChangeText={(value) => onNumericInputChange('property_square_mts', value)}
              keyboardType="numeric"
            />
          </View>
        </>
      )}
    </>
  );
}
