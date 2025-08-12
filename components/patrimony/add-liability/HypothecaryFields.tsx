import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Input, RadioButton, Select } from '@/components/ui';
import Colors from '@/constants/Colors';
import { ApiProperty } from '@/types/api';

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

const PROPERTY_ASSOCIATION_OPTIONS = [
  { label: 'Sí', value: 'yes' },
  { label: 'No', value: 'no' },
];

const CREATE_PROPERTY_OPTIONS = [
  { label: 'Sí', value: 'yes' },
  { label: 'No', value: 'no' },
];

const UNIT_OPTIONS = [
  { label: 'CLP', value: 'clp' },
  { label: 'USD', value: 'usd' },
  { label: 'UF', value: 'uf' },
];

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
  return (
    <>
      <View>
        <RadioButton
          label="¿La deuda está asociada a alguna propiedad?"
          options={PROPERTY_ASSOCIATION_OPTIONS}
          selectedValue={propertyAssociated}
          onSelect={(value) => onSelectChange('property_associated', value)}
        />
      </View>

      {propertyAssociated === 'yes' && (
        <View>
          {loadingProperties ? (
            <View style={{ padding: 16, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={Colors.secondary[500]} />
              <Text style={{ marginTop: 8, color: Colors.gray[500] }}>
                Cargando propiedades...
              </Text>
            </View>
          ) : (
            <Select
              label="Selecciona la propiedad"
              options={properties.map(property => ({
                label: `${property.location} - $${property.commercial_value.toLocaleString('es-CL')}`,
                value: property.id.toString()
              }))}
              value={propertyId}
              onSelect={(value) => onSelectChange('property_id', value)}
              placeholder="Selecciona una propiedad"
            />
          )}
        </View>
      )}

      {propertyAssociated === 'no' && (
        <View>
          <RadioButton
            label="¿Deseas crear una nueva propiedad?"
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
              Ubicación de la propiedad
            </Text>
            <Input
              placeholder="Ej: Las Condes, Santiago"
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
              Valor comercial de la propiedad
            </Text>
            <View className="flex-row">
              <View style={{ width: 100, marginRight: 8 }}>
                <Select
                  options={UNIT_OPTIONS}
                  value={propertyUnit}
                  onSelect={(value) => onSelectChange('property_unit', value)}
                  placeholder="Moneda"
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
              Metros cuadrados
            </Text>
            <Input
              placeholder="65"
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
