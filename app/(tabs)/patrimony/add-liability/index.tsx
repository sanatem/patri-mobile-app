import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  FormLayout,
  Input,
  Select,
} from '@/components/ui';
import { HypothecaryFields } from '@/components/patrimony/add-liability';
import Colors from '@/constants/Colors';
import { createDebt } from '@/services/patrimony/create-debt';
import { updateDebt } from '@/services/patrimony/update-debt';
import { getDebtDetail } from '@/services/patrimony/get-debt-detail';
import { getProperties  } from '@/services/properties/get-properties';
import { useAuth } from '@/providers/AuthProvider';
import { useFormatValue } from '@/hooks/common/useFormatValue';
import { ApiProperty } from '@/types/api';
import { useTranslation } from 'react-i18next';
import { useAssetEditStore } from '@/store/assetEditStore';

const cleanIntegerValue = (value: string) => value.replace(/[^\d]/g, '');

export default function AddLiabilityScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const { editData, clearEditData } = useAssetEditStore();

  const isEditMode = !!(editData?.editMode || params.editMode);
  const debtId = editData?.itemId || (params.debtId ? parseInt(params.debtId as string) : undefined);
  const debtTypeParam = editData?.itemType;

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
  const [saved, setSaved] = useState(false);
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

  useEffect(() => {
    return () => {
      clearEditData();
    };
  }, [clearEditData]);

  useEffect(() => {
    const loadDebtDetail = async () => {
      if (!isEditMode || !debtId || !accessToken || !debtTypeParam) return;

      try {
        const debtData = await getDebtDetail(accessToken, debtId, debtTypeParam as any);

        if (!debtData) {
          console.error('No debt data returned');
          return;
        }

        const getDebtCategoryId = (categoryName: string) => {
          switch(categoryName?.toLowerCase()) {
            case 'automotriz': return '1';
            case 'caja de compensación': return '2';
            case 'consumo': return '3';
            case 'crédito universitario': return '4';
            case 'hipotecario de uso': return '5';
            case 'hipotecario de inversión': return '6';
            case 'línea de crédito': return '7';
            case 'préstamos familiares o amigos': return '8';
            case 'tarjeta de crédito': return '9';
            default: return '1';
          }
        };

        const getDebtType = (debtCategoryId: string) => {
          const categoryMap: Record<string, string> = {
            '1': 'automotive_credit',
            '2': 'consumer_credit',
            '3': 'consumer_credit',
            '4': 'commercial_credit',
            '5': 'mortgage_credit',
            '6': 'mortgage',
            '7': 'credit_line',
            '8': 'family_loan',
            '9': 'credit_card'
          };
          return categoryMap[debtCategoryId] || 'other';
        };

        let baseFormData = {
          name: debtData.name || '',
          debt_category_id: getDebtCategoryId(debtData.debt_category || ''),
          amount: debtData.amount?.toString() || '',
          unit: debtData.unit || 'clp',
          installments_quantity: debtData.installments_quantity?.toString() || '',
          installment_amount: debtData.installment_amount?.toString() || '',
          property_associated: debtData.property_id ? 'yes' : 'no',
          property_id: debtData.property_id?.toString() || '',
          create_property: 'no',
          property_location: '',
          property_commercial_value: '',
          property_unit: 'clp',
          property_square_mts: '',
        };

        try {
          const categoryId = getDebtCategoryId(debtData.debt_category || '');
          const debtType = getDebtType(categoryId) as any;

          const detailData = await getDebtDetail(accessToken, debtId, debtType);
          if (detailData) {
            baseFormData.name = detailData.name || baseFormData.name;
            baseFormData.amount = detailData.amount?.toString() || baseFormData.amount;
            baseFormData.unit = detailData.unit || baseFormData.unit;
            baseFormData.installments_quantity = detailData.installments_quantity?.toString() || baseFormData.installments_quantity;
            baseFormData.installment_amount = detailData.installment_amount?.toString() || baseFormData.installment_amount;

            if (detailData.property_id) {
              baseFormData.property_associated = 'yes';
              baseFormData.property_id = detailData.property_id.toString();
            } else {
              if (categoryId === '5' || categoryId === '6') {
                baseFormData.property_associated = 'no';
              }
            }
          }
        } catch (error) {
          console.error('Error fetching debt detail:', error);
          console.log(error);
        }

        setFormData(baseFormData);
      } catch (error) {
        console.error('Error parsing debt data:', error);
      }
    };

    if (isEditMode) {
      loadDebtDetail();
    }
  }, []);

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
    clearEditData();
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
          amount: cleanIntegerValue(formData.amount),
          unit: formData.unit,
          installments_quantity: parseInt(cleanIntegerValue(formData.installments_quantity)),
          installment_amount: cleanIntegerValue(formData.installment_amount),
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

      let response;
      if (isEditMode && debtId && debtTypeParam) {
        const originalData = await getDebtDetail(accessToken!, debtId, debtTypeParam as any);

        const getDebtType = (debtCategoryId: string) => {
          const categoryMap: Record<string, string> = {
            '1': 'automotive_credit',
            '2': 'consumer_credit',
            '3': 'consumer_credit',
            '4': 'commercial_credit',
            '5': 'mortgage_credit',
            '6': 'mortgage',
            '7': 'credit_line',
            '8': 'family_loan',
            '9': 'credit_card'
          };
          return categoryMap[debtCategoryId] || 'other';
        };

        const debtType = getDebtType(formData.debt_category_id);
        [response] = await Promise.all([
          updateDebt(debtId, debtData, accessToken, debtType),
          new Promise(resolve => setTimeout(resolve, 1000))
        ]);
      } else {
        [response] = await Promise.all([
          createDebt(debtData, accessToken),
          new Promise(resolve => setTimeout(resolve, 1000))
        ]);
      }

      if (response.success) {
        setLoading(false);
        setSaved(true);
        setTimeout(() => {
          clearEditData();
          router.push('/(tabs)/patrimony');
        }, 2500);
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
      title={isEditMode ? t('editLiabilityScreen.title', 'Editar Pasivo') : t('addLiabilityScreen.title')}
      subtitle={isEditMode ? t('editLiabilityScreen.subtitle', 'Modifica la información de tu pasivo') : t('addLiabilityScreen.subtitle')}
      currentStep={1}
      totalSteps={1}
      onNext={handleSubmit}
      onCancel={handleCancel}
      nextButtonTitle={isEditMode ? t('editLiabilityScreen.save_button', 'Guardar cambios') : t('addLiabilityScreen.nextButton')}
      isLoading={loading}
      isSaved={saved}
      loadingText={isEditMode ? t('common.saving') : t('common.creating')}
      savedText={isEditMode ? t('common.saved') : t('common.created')}
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
          disabled={isEditMode}
        />
      </View>

      <View>
        <Text className='text-base font-medium'
          style={{
            color: Colors.primary[500],
            marginBottom: 8,
          }}
        >
          {t('addLiabilityScreen.fields.amountLabel')}
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