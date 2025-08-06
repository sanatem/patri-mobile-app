import React, { useState } from 'react';
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
    property_associated: 'no',
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
    const cleanValue = cleanIntegerValue(value);
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
      setErrors(['No hay token de autenticación disponible']);
      return;
    }

    setLoading(true);
    try {
      const debtData = {
        debt: {
          name: formData.name,
          debt_category_id: parseInt(formData.debt_category_id),
          amount: parseInt(cleanIntegerValue(formData.amount)),
          unit: formData.unit,
          installments_quantity: parseInt(cleanIntegerValue(formData.installments_quantity)),
          installment_amount: parseInt(cleanIntegerValue(formData.installment_amount)),
          property_associated: formData.property_associated === 'yes',
        }
      };

      const response = await createDebt(debtData, accessToken);

      if (response.success) {
        router.back();
      } else {
        setErrors([response.error || 'Error al crear el pasivo']);
      }
    } catch (error) {
      console.error('Error al guardar pasivo:', error);
      setErrors(['Error inesperado al crear el pasivo']);
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

      <View>
        <RadioButton
          label="¿La deuda está asociada a alguna propiedad?"
          options={PROPERTY_ASSOCIATION_OPTIONS}
          selectedValue={formData.property_associated}
          onSelect={(value) => handleSelectChange('property_associated', value)}
        />
      </View>
    </FormLayout>
  );
} 