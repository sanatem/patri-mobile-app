import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import {
  FormLayout,
  Input,
  Select,
  RadioButton,
} from '@/components/ui';
import Colors from '@/constants/Colors';
import { createDebt } from '@/services/patrimony/create-debt';
import { getProperty, Property } from '@/services/properties/get-property';
import { useAuth } from '@/providers/AuthProvider';
import { useFormatValue } from '@/hooks/common/useFormatValue';

const DEBT_CATEGORY_OPTIONS = [
  { label: 'Automotriz', value: '1' },
  { label: 'Caja de compensación', value: '2' },
  { label: 'Consumo', value: '3' },
  { label: 'Crédito Universitario', value: '4' },
  { label: 'Hipotecario de uso', value: '5' },
  { label: 'Hipotecario de inversión', value: '6' },
  { label: 'Línea de Crédito', value: '7' },
  { label: 'Préstamos familiares o amic', value: '8' },
  { label: 'Tarjeta de Crédito', value: '9' },
];

const UNIT_OPTIONS = [
  { label: 'CLP', value: 'clp' },
  { label: 'USD', value: 'usd' },
  { label: 'UF', value: 'uf' },
];

const cleanIntegerValue = (value: string) => value.replace(/[^\d]/g, '');

const PROPERTY_ASSOCIATION_OPTIONS = [
  { label: 'Sí', value: 'yes' },
  { label: 'No', value: 'no' },
];

const CREATE_PROPERTY_OPTIONS = [
  { label: 'Sí', value: 'yes' },
  { label: 'No', value: 'no' },
];

export default function AddLiabilityScreen() {
  const { accessToken } = useAuth();
  const { formatValue } = useFormatValue();
  const [formData, setFormData] = useState({
    name: '',
    debt_category_id: '',
    amount: '',
    unit: 'clp',
    installments_quantity: '',
    installment_amount: '',
    property_associated: 'yes',
    property_id: '',
    create_property: 'no',
    property_location: '',
    property_commercial_value: '',
    property_square_mts: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear server error when user makes changes
    if (serverError) {
      setServerError(null);
    }
  };

  const handleNumericInputChange = (field: string, value: string) => {
    const cleanValue = cleanIntegerValue(value);
    setFormData(prev => ({
      ...prev,
      [field]: cleanValue
    }));
    if (serverError) {
      setServerError(null);
    }
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (serverError) {
      setServerError(null);
    }
  };

  const loadProperties = async () => {
    if (!accessToken) return;
    
    setLoadingProperties(true);
    try {
      const response = await getProperty(accessToken);
      if (response.success && response.properties) {
        setProperties(response.properties);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoadingProperties(false);
    }
  };

  // Load properties when property_associated changes to 'yes'
  useEffect(() => {
    if (formData.property_associated === 'yes' && properties.length === 0) {
      loadProperties();
    }
  }, [formData.property_associated]);

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!formData.name.trim()) {
      newErrors.push('El nombre del pasivo es requerido');
    }
    if (!formData.debt_category_id) {
      newErrors.push('Debes seleccionar una categoría de pasivo');
    }
    if (!formData.amount.trim()) {
      newErrors.push('El monto del pasivo es requerido');
    } else {
      const amount = parseFloat(cleanIntegerValue(formData.amount));
      if (isNaN(amount) || amount <= 0) {
        newErrors.push('El monto debe ser un número válido mayor a 0');
      }
    }
    if (!formData.installments_quantity.trim()) {
      newErrors.push('El número de cuotas es requerido');
    } else {
      const installments = parseInt(cleanIntegerValue(formData.installments_quantity));
      if (isNaN(installments) || installments <= 0) {
        newErrors.push('El número de cuotas debe ser un número válido mayor a 0');
      }
    }
    if (!formData.installment_amount.trim()) {
      newErrors.push('El monto de la cuota es requerido');
    } else {
      const installment = parseFloat(cleanIntegerValue(formData.installment_amount));
      if (isNaN(installment) || installment <= 0) {
        newErrors.push('El monto de la cuota debe ser un número válido mayor a 0');
      }
    }

    if (formData.debt_category_id === '5' || formData.debt_category_id === '6') {
      if (formData.property_associated === 'yes') {
        if (!formData.property_id) {
          newErrors.push('Debes seleccionar una propiedad');
        }
      } else if (formData.create_property === 'yes') {
        if (!formData.property_location.trim()) {
          newErrors.push('La ubicación de la propiedad es requerida');
        }
        if (!formData.property_commercial_value.trim()) {
          newErrors.push('El valor comercial de la propiedad es requerido');
        } else {
          const commercialValue = parseFloat(cleanIntegerValue(formData.property_commercial_value));
          if (isNaN(commercialValue) || commercialValue <= 0) {
            newErrors.push('El valor comercial debe ser un número válido mayor a 0');
          }
        }
        if (!formData.property_square_mts.trim()) {
          newErrors.push('Los metros cuadrados de la propiedad son requeridos');
        } else {
          const squareMts = parseFloat(cleanIntegerValue(formData.property_square_mts));
          if (isNaN(squareMts) || squareMts <= 0) {
            newErrors.push('Los metros cuadrados deben ser un número válido mayor a 0');
          }
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
    if (!accessToken) {
      setServerError('No hay token de autenticación disponible');
      return;
    }

    setLoading(true);
    setServerError(null);
    try {
      const debtData: any = {
        debt: {
          name: formData.name,
          debt_category_id: parseInt(formData.debt_category_id),
          amount: cleanIntegerValue(formData.amount), // Enviar como string
          unit: formData.unit,
          installments_quantity: parseInt(cleanIntegerValue(formData.installments_quantity)),
          installment_amount: cleanIntegerValue(formData.installment_amount), // Enviar como string
        }
      };
      if (formData.debt_category_id === '5' || formData.debt_category_id === '6') {
        if (formData.property_associated === 'yes') {
          debtData.debt.property_id = parseInt(formData.property_id);
        } else if (formData.create_property === 'yes') {
          const cleanCommercialValue = cleanIntegerValue(formData.property_commercial_value);
          const formattedCommercialValue = cleanCommercialValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
          debtData.debt.property_attributes = {
            commercial_value: String(formattedCommercialValue),
            unit: formData.unit,
            location: formData.property_location.trim(),
            square_mts: parseInt(cleanIntegerValue(formData.property_square_mts))
          };
        }
      }

      const response = await createDebt(debtData, accessToken);

      if (response.success) {
        setTimeout(() => {
          router.back();
        }, 500);
      } else {
        setServerError(response.error || 'Error al crear el pasivo');
      }
    } catch (error) {
      setServerError('Error inesperado al crear el pasivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormLayout
      title="Añadir un nuevo Pasivo"
      subtitle="Cuéntanos sobre tu pasivo para incluirlo en tu patrimonio 💳"
      currentStep={1}
      totalSteps={1}
      onNext={handleSubmit}
      onCancel={handleCancel}
      nextButtonTitle="Crear Pasivo"
      isLoading={loading}
      isNextDisabled={errors.length > 0}
      error={serverError || (errors.length > 0 ? errors[0] : null)}
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
          placeholder="Ej: Crédito hipotecario"
          value={formData.name}
          onChangeText={(value) => handleInputChange('name', value)}
          autoCapitalize="words"
        />
      </View>

      <View>
        <Select
          label="¿Qué tipo de deuda tienes?"
          options={DEBT_CATEGORY_OPTIONS}
          value={formData.debt_category_id}
          onSelect={(value) => handleSelectChange('debt_category_id', value)}
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
          ¿Cuál es el saldo a pagar?
        </Text>
        <View className="flex-row">
          <View style={{ width: 100, marginRight: 8 }}>
            <Select
              options={UNIT_OPTIONS}
              value={formData.unit}
              onSelect={(value) => handleSelectChange('unit', value)}
              placeholder="Moneda"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              placeholder="$80.000.000"
              value={formData.amount ? formatValue(formData.amount) : ''}
              onChangeText={(value) => handleNumericInputChange('amount', value)}
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
          ¿Cuántas cuotas te faltan por pagar?
        </Text>
        <Input
          placeholder="240"
          value={formData.installments_quantity}
          onChangeText={(value) => handleNumericInputChange('installments_quantity', value)}
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
          ¿Cuál es el valor de cada cuota?
        </Text>
        <Input
          placeholder="$500.000"
          value={formData.installment_amount ? formatValue(formData.installment_amount) : ''}
          onChangeText={(value) => handleNumericInputChange('installment_amount', value)}
          keyboardType="numeric"
        />
      </View>

      {(formData.debt_category_id === '5' || formData.debt_category_id === '6') && (
        <View>
          <RadioButton
            label="¿La deuda está asociada a alguna propiedad?"
            options={PROPERTY_ASSOCIATION_OPTIONS}
            selectedValue={formData.property_associated}
            onSelect={(value) => handleSelectChange('property_associated', value)}
          />
        </View>
      )}

      {(formData.debt_category_id === '5' || formData.debt_category_id === '6') && 
       formData.property_associated === 'yes' && (
        <View>
          <Select
            label="Selecciona la propiedad"
            options={properties.map(property => ({
              label: `${property.location} - $${property.commercial_value.toLocaleString('es-CL')}`,
              value: property.id.toString()
            }))}
            value={formData.property_id}
            onSelect={(value) => handleSelectChange('property_id', value)}
            placeholder="Selecciona una propiedad"
          />
        </View>
      )}

      {(formData.debt_category_id === '5' || formData.debt_category_id === '6') && 
       formData.property_associated === 'no' && (
        <View>
          <RadioButton
            label="¿Deseas crear una nueva propiedad?"
            options={CREATE_PROPERTY_OPTIONS}
            selectedValue={formData.create_property}
            onSelect={(value) => handleSelectChange('create_property', value)}
          />
        </View>
      )}

      {(formData.debt_category_id === '5' || formData.debt_category_id === '6') && 
       formData.property_associated === 'no' && formData.create_property === 'yes' && (
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
              value={formData.property_location}
              onChangeText={(value) => handleInputChange('property_location', value)}
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
            <Input
              placeholder="$550.000.000"
              value={formData.property_commercial_value ? formatValue(formData.property_commercial_value) : ''}
              onChangeText={(value) => handleNumericInputChange('property_commercial_value', value)}
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
              Metros cuadrados
            </Text>
            <Input
              placeholder="65"
              value={formData.property_square_mts}
              onChangeText={(value) => handleNumericInputChange('property_square_mts', value)}
              keyboardType="numeric"
            />
          </View>
        </>
      )}
    </FormLayout>
  );
} 