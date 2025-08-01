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

export default function AddLiabilityScreen() {
  const { accessToken } = useAuth();
  const { formatValue, cleanNumericValue } = useFormatValue();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    debt_category_id: '',
    amount: '',
    unit: 'clp',
    installments_quantity: '',
    installment_amount: '',
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
        newErrors.push('El nombre del pasivo es requerido');
      }
      if (!formData.debt_category_id) {
        newErrors.push('Debes seleccionar una categoría de pasivo');
      }
      if (!formData.amount.trim()) {
        newErrors.push('El monto del pasivo es requerido');
      } else {
        const amount = parseFloat(formData.amount.replace(/[^\d]/g, ''));
        if (isNaN(amount) || amount <= 0) {
          newErrors.push('El monto debe ser un número válido mayor a 0');
        }
      }
      if (!formData.installments_quantity.trim()) {
        newErrors.push('El número de cuotas es requerido');
      } else {
        const installments = parseInt(formData.installments_quantity);
        if (isNaN(installments) || installments <= 0) {
          newErrors.push('El número de cuotas debe ser un número válido mayor a 0');
        }
      }
      if (!formData.installment_amount.trim()) {
        newErrors.push('El monto de la cuota es requerido');
      } else {
        const installment = parseFloat(formData.installment_amount.replace(/[^\d]/g, ''));
        if (isNaN(installment) || installment <= 0) {
          newErrors.push('El monto de la cuota debe ser un número válido mayor a 0');
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
      const debtData = {
        debt: {
          name: formData.name,
          debt_category_id: parseInt(formData.debt_category_id),
          amount: parseInt(formData.amount.replace(/[^\d]/g, '')),
          unit: formData.unit,
          installments_quantity: parseInt(formData.installments_quantity),
          installment_amount: parseInt(formData.installment_amount.replace(/[^\d]/g, '')),
          comments: formData.comments
        }
      };

      if (!accessToken) {
        throw new Error('No hay token de autenticación disponible');
      }

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
          </>
        );
      case 2:
        return (
          <View>
            <Textarea
              label="Comentarios (opcional)"
              placeholder="Agrega comentarios sobre el pasivo"
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
        return 'Añadir un nuevo Pasivo';
      case 2:
        return 'Añadir un nuevo Pasivo';
      default:
        return 'Agregar Pasivo';
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1:
        return '';
      case 2:
        return 'Agrega comentarios adicionales si lo deseas 💬';
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
      nextButtonTitle={currentStep === 2 ? "Guardar Pasivo" : "Siguiente"}
      isLoading={loading}
      isNextDisabled={errors.length > 0}
      error={errors.length > 0 ? errors[0] : null}
    >
      {renderStepContent()}
    </FormLayout>
  );
} 