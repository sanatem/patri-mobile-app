import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import {
  FormLayout,
  Input,
  Select,
  Textarea
} from '@/components/ui';
import Colors from '@/constants/Colors';
import { createAsset } from '@/services/patrimony/create-asset';
import { useAuth } from '@/providers/AuthProvider';
import { useFormatValue } from '@/hooks/common/useFormatValue';

const ASSET_CATEGORY_OPTIONS = [
  { label: 'Auto o moto', value: '1' },
  { label: 'Terreno', value: '2' },
  { label: 'Otros', value: '3' },
];

const ASSET_KIND_OPTIONS = [
  { label: 'Inversión', value: 'investment' },
  { label: 'En uso', value: 'in_use' },
];

const UNIT_OPTIONS = [
  { label: 'CLP', value: 'clp' },
  { label: 'USD', value: 'usd' },
  { label: 'UF', value: 'uf' },
];

export default function AddAssetScreen() {
  const { accessToken } = useAuth();
  const { formatValue, cleanNumericValue } = useFormatValue();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    asset_category_id: '',
    commercial_value: '',
    unit: 'clp',
    kind: 'investment',
    comments: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNumericInputChange = (field: string, value: string) => {
    const cleanValue = cleanNumericValue(value);
    setFormData(prev => ({
      ...prev,
      [field]: cleanValue
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep = (step: number) => {
    const newErrors: string[] = [];

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.push('El nombre del activo es requerido');
      }
      if (!formData.asset_category_id) {
        newErrors.push('Debes seleccionar una categoría de activo');
      }
      if (!formData.commercial_value.trim()) {
        newErrors.push('El valor comercial del activo es requerido');
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

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 2) {
        setCurrentStep(currentStep + 1);
      } else {
        handleComplete();
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Preparar datos para la API
      const assetData = {
        asset: {
          name: formData.name,
          asset_category_id: parseInt(formData.asset_category_id),
          commercial_value: parseInt(formData.commercial_value.replace(/[^\d]/g, '')),
          unit: formData.unit,
          kind: formData.kind,
          comments: formData.comments
        }
      };

      console.log('Guardando activo:', assetData);

      if (!accessToken) {
        throw new Error('No hay token de autenticación disponible');
      }

      // Llamada a la API
      const response = await createAsset(assetData, accessToken);

             if (response.success) {
         console.log('Activo creado exitosamente:', response.data);
         // Navegar de vuelta
         router.back();
       } else {
        console.error('Error al crear activo:', response.error);
        setErrors([response.error || 'Error al crear el activo']);
      }
    } catch (error) {
      console.error('Error al guardar activo:', error);
      setErrors(['Error inesperado al crear el activo']);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
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
                label="¿Qué activo tienes?"
                options={ASSET_CATEGORY_OPTIONS}
                value={formData.asset_category_id}
                onSelect={(value) => handleSelectChange('asset_category_id', value)}
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
                <View className="flex-1 mr-2">
                  <Select
                    options={UNIT_OPTIONS}
                    value={formData.unit}
                    onSelect={(value) => handleSelectChange('unit', value)}
                    placeholder="Moneda"
                  />
                </View>
                                 <View className="flex-2">
                   <Input
                     placeholder="$150.000.000"
                     value={formData.commercial_value ? formatValue(formData.commercial_value) : ''}
                     onChangeText={(value) => handleNumericInputChange('commercial_value', value)}
                     keyboardType="numeric"
                   />
                 </View>
              </View>
            </View>

            <View>
              <Select
                label="¿Qué tipo de activo es?"
                options={ASSET_KIND_OPTIONS}
                value={formData.kind}
                onSelect={(value) => handleSelectChange('kind', value)}
                placeholder="Selecciona el tipo"
              />
            </View>
          </>
        );
      case 2:
        return (
          <View>
                         <Textarea
               label="Comentarios (opcional)"
               placeholder="Agrega comentarios sobre el activo"
               value={formData.comments}
               onChangeText={(value) => handleInputChange('comments', value)}
             />
          </View>
        );
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Añadir un nuevo Activo';
      case 2:
        return 'Añadir un nuevo Activo';
      default:
        return 'Agregar Activo';
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1:
        return 'Ingresa la información básica de tu activo';
      case 2:
        return 'Agrega comentarios adicionales si lo deseas';
      default:
        return '';
    }
  };

  return (
    <FormLayout
      title={getStepTitle()}
      subtitle={getStepSubtitle()}
      currentStep={currentStep}
      totalSteps={2}
      onNext={handleNextStep}
      onPrevious={currentStep > 1 ? handlePreviousStep : undefined}
      onCancel={handleCancel}
      nextButtonTitle={currentStep === 2 ? "Guardar Activo" : "Siguiente"}
      isLoading={loading}
      isNextDisabled={errors.length > 0}
      error={errors.length > 0 ? errors[0] : null}
    >
      {renderStepContent()}
    </FormLayout>
  );
} 