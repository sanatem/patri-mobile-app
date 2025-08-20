import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import {
  FormLayout,
  Input,
  Select,
} from '@/components/ui';
import { HypothecaryFields } from '@/components/patrimony/add-liability';
import Colors from '@/constants/Colors';
import { createDebt } from '@/services/patrimony/create-debt';
import { getProperties  } from '@/services/properties/get-properties';
import { useAuth } from '@/providers/AuthProvider';
import { useFormatValue } from '@/hooks/common/useFormatValue';
import { ApiProperty } from '@/types/api';
import { useTranslation } from 'react-i18next';

const cleanIntegerValue = (value: string) => value.replace(/[^\d]/g, '');

export default function AddLiabilityScreen() {
  const { t } = useTranslation();

  const DEBT_CATEGORY_OPTIONS = [
    { label: t('addLiabilityScreen.debtCategoryOptions.1'), value: '1' },
    { label: t('addLiabilityScreen.debtCategoryOptions.2'), value: '2' },
    { label: t('addLiabilityScreen.debtCategoryOptions.3'), value: '3' },
    { label: t('addLiabilityScreen.debtCategoryOptions.4'), value: '4' },
    { label: t('addLiabilityScreen.debtCategoryOptions.5'), value: '5' },
    { label: t('addLiabilityScreen.debtCategoryOptions.6'), value: '6' },
    { label: t('addLiabilityScreen.debtCategoryOptions.7'), value: '7' },
    { label: t('addLiabilityScreen.debtCategoryOptions.8'), value: '8' },
    { label: t('addLiabilityScreen.debtCategoryOptions.9'), value: '9' },
  ];
  
  const UNIT_OPTIONS = [
    { label: t('addLiabilityScreen.unitOptions.clp'), value: 'clp' },
    { label: t('addLiabilityScreen.unitOptions.usd'), value: 'usd' },
    { label: t('addLiabilityScreen.unitOptions.uf'), value: 'uf' },
  ];
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
    property_unit: 'clp',
    property_square_mts: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [properties, setProperties] = useState<ApiProperty[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
      const response = await getProperties(accessToken, { page: 1, per_page: 100 });
      if (response && response.properties) {
        setProperties(response.properties);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoadingProperties(false);
    }
  };

  useEffect(() => {
    if (
      accessToken &&
      formData.property_associated === 'yes' &&
      properties.length === 0
    ) {
      loadProperties();
    }
  }, [formData.property_associated, accessToken]);

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!formData.name.trim()) {
      newErrors.push(t('addLiabilityScreen.errors.nameRequired'));
    }
    if (!formData.debt_category_id) {
      newErrors.push(t('addLiabilityScreen.errors.categoryRequired'));
    }
    if (!formData.amount.trim()) {
      newErrors.push(t('addLiabilityScreen.errors.amountRequired'));
    } else {
      const amount = parseFloat(cleanIntegerValue(formData.amount));
      if (isNaN(amount) || amount <= 0) {
        newErrors.push(t('addLiabilityScreen.errors.amountInvalid'));
      }
    }
    if (!formData.installments_quantity.trim()) {
      newErrors.push(t('addLiabilityScreen.errors.installmentsQuantityRequired'));
    } else {
      const installments = parseInt(cleanIntegerValue(formData.installments_quantity));
      if (isNaN(installments) || installments <= 0) {
        newErrors.push(t('addLiabilityScreen.errors.installmentsQuantityInvalid'));
      }
    }
    if (!formData.installment_amount.trim()) {
      newErrors.push(t('addLiabilityScreen.errors.installmentAmountRequired'));
    } else {
      const installment = parseFloat(cleanIntegerValue(formData.installment_amount));
      if (isNaN(installment) || installment <= 0) {
        newErrors.push(t('addLiabilityScreen.errors.installmentAmountInvalid'));
      }
    }

    if (formData.debt_category_id === '5' || formData.debt_category_id === '6') {
      if (formData.property_associated === 'yes') {
        if (!formData.property_id) {
          newErrors.push(t('addLiabilityScreen.errors.propertyRequired'));
        }
      } else if (formData.create_property === 'yes') {
        if (!formData.property_location.trim()) {
          newErrors.push(t('addLiabilityScreen.errors.propertyLocationRequired'));
        }
        if (!formData.property_commercial_value.trim()) {
          newErrors.push(t('addLiabilityScreen.errors.propertyValueRequired'));
        } else {
          const commercialValue = parseFloat(cleanIntegerValue(formData.property_commercial_value));
          if (isNaN(commercialValue) || commercialValue <= 0) {
            newErrors.push(t('addLiabilityScreen.errors.propertyValueInvalid'));
          }
        }
        if (!formData.property_square_mts.trim()) {
          newErrors.push(t('addLiabilityScreen.errors.propertySquareMtsRequired'));
        } else {
          const squareMts = parseFloat(cleanIntegerValue(formData.property_square_mts));
          if (isNaN(squareMts) || squareMts <= 0) {
            newErrors.push(t('addLiabilityScreen.errors.propertySquareMtsInvalid'));
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
      setServerError(t('addLiabilityScreen.errors.authTokenMissing'));
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
            unit: formData.property_unit,
            location: formData.property_location.trim(),
            square_mts: parseInt(cleanIntegerValue(formData.property_square_mts))
          };
        }
      }

      const response = await createDebt(debtData, accessToken);

      if (response.success) {
        router.push('/(tabs)/patrimony');
      } else {
        setServerError(response.error || t('addLiabilityScreen.errors.creationError'));
      }
    } catch (error) {
      setServerError(t('addLiabilityScreen.errors.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  const isHypothecaryDebt = formData.debt_category_id === '5' || formData.debt_category_id === '6';

  return (
    <FormLayout
      title={t('addLiabilityScreen.title')}
      subtitle={t('addLiabilityScreen.subtitle')}
      currentStep={1}
      totalSteps={1}
      onNext={handleSubmit}
      onCancel={handleCancel}
      nextButtonTitle={t('addLiabilityScreen.nextButton')}
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
          {t('addLiabilityScreen.fields.nameLabel')}
        </Text>
        <Input
          placeholder={t('addLiabilityScreen.fields.namePlaceholder')}
          value={formData.name}
          onChangeText={(value) => handleInputChange('name', value)}
          autoCapitalize="words"
        />
      </View>

      <View>
        <Select
          label={t('addLiabilityScreen.fields.debtCategoryLabel')}
          options={DEBT_CATEGORY_OPTIONS}
          value={formData.debt_category_id}
          onSelect={(value) => handleSelectChange('debt_category_id', value)}
          placeholder={t('addLiabilityScreen.fields.debtCategoryPlaceholder')}
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
              placeholder={t('addLiabilityScreen.fields.unitPlaceholder')}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              placeholder={t('addLiabilityScreen.fields.amountPlaceholder')}
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
          {t('addLiabilityScreen.fields.installmentsQuantityLabel')}
        </Text>
        <Input
          placeholder={t('addLiabilityScreen.fields.installmentsQuantityPlaceholder')}
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
          {t('addLiabilityScreen.fields.installmentAmountLabel')}
        </Text>
        <Input
          placeholder={t('addLiabilityScreen.fields.installmentAmountPlaceholder')}
          value={formData.installment_amount ? formatValue(formData.installment_amount) : ''}
          onChangeText={(value) => handleNumericInputChange('installment_amount', value)}
          keyboardType="numeric"
        />
      </View>

      {isHypothecaryDebt && (
        <HypothecaryFields
          propertyAssociated={formData.property_associated}
          propertyId={formData.property_id}
          createProperty={formData.create_property}
          propertyLocation={formData.property_location}
          propertyCommercialValue={formData.property_commercial_value}
          propertyUnit={formData.property_unit}
          propertySquareMts={formData.property_square_mts}
          properties={properties}
          loadingProperties={loadingProperties}
          onInputChange={handleInputChange}
          onSelectChange={handleSelectChange}
          onNumericInputChange={handleNumericInputChange}
          formatValue={formatValue}
        />
      )}
    </FormLayout>
  );
} 