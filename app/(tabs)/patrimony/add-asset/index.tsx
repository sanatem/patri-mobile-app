import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import {
  FormLayout,
  Input,
  Select,
} from '@/components/ui';
import Colors from '@/constants/Colors';
import { createAsset } from '@/services/patrimony/create-asset';
import { createProperty } from '@/services/properties/create-property';
import { useAuth } from '@/providers/AuthProvider';
import { useFormatValue } from '@/hooks/common/useFormatValue';
import { FixedAssetFields, InvestmentFields, PropertyFields } from '@/components/patrimony/add-asset';

const ASSET_KIND_OPTIONS = [
  { label: 'Activo fijo', value: 'fixed_asset' },
  { label: 'Inversión o Ahorro', value: 'investment' },
  { label: 'Propiedad', value: 'property' },
];

export default function AddAssetScreen() {
  const { accessToken } = useAuth();
  const { formatValue, cleanNumericValue } = useFormatValue();
  const [formData, setFormData] = useState({
    name: '',
    asset_category_id: '',
    commercial_value: '',
    unit: 'clp',
    kind: 'fixed_asset',
    property_kind: 'own',
    location: '',
    square_mts: '',
    investment_type: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (errors.length === 0 && loading) {
      setLoading(false);
    }
  }, [errors, loading]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleNumericInputChange = (field: string, value: string) => {
    const cleanValue = cleanNumericValue(value);
    setFormData(prev => ({
      ...prev,
      [field]: cleanValue
    }));
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!formData.name.trim()) {
      newErrors.push('El nombre del activo es requerido');
    }
    if (!formData.kind) {
      newErrors.push('Debes seleccionar un tipo de activo');
    }
    
    if (formData.kind === 'property') {
      if (!formData.location.trim()) {
        newErrors.push('La ubicación es requerida para propiedades');
      }
      if (!formData.square_mts.trim()) {
        newErrors.push('Los metros cuadrados son requeridos');
      } else {
        const mts = parseFloat(formData.square_mts);
        if (isNaN(mts) || mts <= 0) {
          newErrors.push('Los metros cuadrados deben ser un número válido mayor a 0');
        }
      }
          } else if (formData.kind === 'fixed_asset') {
        if (!formData.asset_category_id) {
          newErrors.push('Debes seleccionar una categoría de activo');
        }
      } else if (formData.kind === 'investment') {
        if (!formData.investment_type) {
          newErrors.push('Debes seleccionar un tipo de inversión o ahorro');
        }
      }
    
    if (formData.kind !== 'investment') {
      if (!formData.commercial_value.trim()) {
        newErrors.push('El valor comercial es requerido');
      } else {
        const value = parseFloat(formData.commercial_value.replace(/[^\d]/g, ''));
        if (isNaN(value) || value <= 0) {
          newErrors.push('El valor debe ser un número válido mayor a 0');
        }
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      handleComplete();
    }
  };

  const handleCancel = () => {
    router.push('/(tabs)/patrimony');
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      if (!accessToken) {
        throw new Error('No hay token de autenticación disponible');
      }

      if (formData.kind === 'property') {
        const propertyType = formData.property_kind === 'own' ? 'main_home' : 'investment';
        const cleanCommercialValue = formData.commercial_value.replace(/[^\d]/g, '');
        
        if (!cleanCommercialValue) {
          setErrors(['El valor comercial es requerido']);
          setLoading(false);
          return;
        }
        
        if (!formData.location.trim()) {
          setErrors(['La ubicación es requerida']);
          setLoading(false);
          return;
        }
        
        if (!formData.square_mts.trim()) {
          setErrors(['Los metros cuadrados son requeridos']);
          setLoading(false);
          return;
        }
        
        const squareMts = parseInt(formData.square_mts);
        if (isNaN(squareMts) || squareMts <= 0) {
          setErrors(['Los metros cuadrados deben ser un número válido mayor a 0']);
          setLoading(false);
          return;
        }
        
        const propertyData = {
          property_type: propertyType as 'main_home' | 'investment',
          property: {
            kind: 'own' as 'own',
            property_attributes: {
              location: formData.location.trim(),
              commercial_value: cleanCommercialValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
              square_mts: squareMts,
            }
          }
        };

        const propertyResponse = await createProperty(propertyData, accessToken);
        
        if (propertyResponse.success) {
          setTimeout(() => {
            router.back();
          }, 500);
        } else {
          setErrors([propertyResponse.error || 'Error al crear la propiedad']);
          setLoading(false);
        }
      } else if (formData.kind === 'fixed_asset') {
        const assetData = {
          asset: {
            name: formData.name,
            asset_category_id: parseInt(formData.asset_category_id),
            commercial_value: parseInt(formData.commercial_value.replace(/[^\d]/g, '')),
            unit: formData.unit,
            kind: formData.kind,
          }
        };

        const response = await createAsset(assetData, accessToken);

        if (response.success) {
          setTimeout(() => {
            router.back();
          }, 500);
        } else {
          setErrors([response.error || 'Error al crear el activo']);
          setLoading(false);
        }
      } else if (formData.kind === 'investment') {
        const assetData = {
          asset: {
            name: formData.name,
            asset_category_id: 3,
            commercial_value: 0,
            unit: 'clp',
            kind: formData.kind,
            comments: `Tipo de inversión: ${formData.investment_type}`,
          }
        };

        const response = await createAsset(assetData, accessToken);

        if (response.success) {
          setTimeout(() => {
            router.back();
          }, 500);
        } else {
          setErrors([response.error || 'Error al crear la inversión/ahorro']);
          setLoading(false);
        }
      }
    } catch (error) {
      setErrors(['Error inesperado al crear el activo']);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormLayout
      title="Añadir un nuevo Activo"
      subtitle="Cuéntanos sobre tu activo para incluirlo en tu patrimonio 💼"
      currentStep={1}
      totalSteps={1}
      onNext={handleSubmit}
      onCancel={handleCancel}
      nextButtonTitle="Crear Activo"
      isLoading={loading}
      isNextDisabled={errors.length > 0}
      error={errors.length > 0 ? errors[0] : null}
    >
      <View>
        <Text className='text-base font-medium'
          style={{
            color: Colors.primary[500],
            marginBottom: 8,
          }}
        >
          Nombre
        </Text>
        <Input
          placeholder="Ej: Casa principal"
          value={formData.name}
          onChangeText={(value) => handleInputChange('name', value)}
          autoCapitalize="words"
        />
      </View>

      <View>
        <Select
          label="¿Qué tipo de activo tienes?"
          options={ASSET_KIND_OPTIONS}
          value={formData.kind}
          onSelect={(value) => handleSelectChange('kind', value)}
          placeholder="Selecciona el tipo de activo"
        />
      </View>

      {formData.kind === 'property' ? (
        <PropertyFields
          location={formData.location}
          square_mts={formData.square_mts}
          property_kind={formData.property_kind}
          commercial_value={formData.commercial_value}
          unit={formData.unit}
          onInputChange={handleInputChange}
          onSelectChange={handleSelectChange}
          onNumericInputChange={handleNumericInputChange}
          formatValue={formatValue}
        />
      ) : formData.kind === 'fixed_asset' ? (
        <FixedAssetFields
          asset_category_id={formData.asset_category_id}
          commercial_value={formData.commercial_value}
          unit={formData.unit}
          onSelectChange={handleSelectChange}
          onNumericInputChange={handleNumericInputChange}
          formatValue={formatValue}
        />
      ) : formData.kind === 'investment' ? (
        <InvestmentFields
          investment_type={formData.investment_type}
          onSelectChange={handleSelectChange}
        />
      ) : null}
    </FormLayout>
  );
} 