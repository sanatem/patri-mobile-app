import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  FormLayout,
  Input,
  Select,
} from '@/components/ui';
import Colors from '@/constants/Colors';
import { createAsset } from '@/services/patrimony/create-asset';
import { updateAsset } from '@/services/patrimony/update-asset';
import { createProperty } from '@/services/properties/create-property';
import { useAuth } from '@/providers/AuthProvider';
import { useFormatValue } from '@/hooks/common/useFormatValue';
import { FixedAssetFields, PropertyFields, SavingInstrumentFields } from '@/components/patrimony/add-asset';
import { useTranslation } from 'react-i18next';

export default function AddAssetScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const isEditMode = !!(params.editMode && params.rawData);

  const ASSET_KIND_OPTIONS = [
    { label: t('addAssetScreen.asset_kind_options.fixed_asset'), value: 'fixed_asset' },
    { label: t('addAssetScreen.asset_kind_options.investment'), value: 'investment' },
    { label: t('addAssetScreen.asset_kind_options.property'), value: 'property' },
  ];
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
    institution: '',
    fund1: '',
    fund1_percentage: '',
    fund2: '',
    fund2_percentage: '',
    tax_regime: '',
    brokerage: '',
    bank: '',
    platform: '',
    description: '',
    crowdfunding_institution: '',
    crowdfunding_credit_id: '',
    period_return_rate: '',
    due_date: '',
    deposit_type: '',
    opening_date: '',
    maturity_date: '',
    fund: '',
    fund_kind: '',
    fund_id: '',
    fund_series_id: '',
    series: '',
    mutual_fund_manager_id: '',
    comments: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (errors.length === 0 && loading) {
      setLoading(false);
    }
  }, [errors, loading]);

  useEffect(() => {
    if (isEditMode && params.rawData) {
      try {
        const assetData = JSON.parse(params.rawData as string);

        const getCategoryId = (categoryName: string) => {
          switch(categoryName) {
            case 'Auto o moto': return '1';
            case 'Joyería': return '2';
            case 'Electrónicos': return '3';
            default: return '1';
          }
        };

        setFormData({
          name: assetData.name || '',
          asset_category_id: assetData.asset_category_id?.toString() || getCategoryId(assetData.category || ''),
          commercial_value: assetData.commercial_value?.toString() || '',
          unit: assetData.unit || 'clp',
          kind: assetData.kind === 'in_use' ? 'fixed_asset' : (assetData.kind || 'fixed_asset'),
          property_kind: 'own',
          location: '',
          square_mts: '',
          investment_type: '',
          institution: '',
          fund1: '',
          fund1_percentage: '',
          fund2: '',
          fund2_percentage: '',
          tax_regime: '',
          brokerage: '',
          bank: '',
          platform: '',
          description: '',
          crowdfunding_institution: '',
          crowdfunding_credit_id: '',
          period_return_rate: '',
          due_date: '',
          deposit_type: '',
          opening_date: '',
          maturity_date: '',
          fund: '',
          fund_kind: '',
          fund_id: '',
          fund_series_id: '',
          series: '',
          mutual_fund_manager_id: '',
          comments: assetData.comments || '',
        });
      } catch (error) {
        console.error('Error parsing asset data:', error);
      }
    }
  }, [isEditMode, params.rawData]);

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
      newErrors.push(t('addAssetScreen.errors.nameRequired'));
    }
    if (!formData.kind) {
      newErrors.push(t('addAssetScreen.errors.kindRequired'));
    }
    
    if (formData.kind === 'property') {
      if (!formData.location.trim()) {
        newErrors.push(t('addAssetScreen.errors.locationRequired'));
      }
      if (!formData.square_mts.trim()) {
        newErrors.push(t('addAssetScreen.errors.squareMtsRequired'));
      } else {
        const mts = parseFloat(formData.square_mts);
        if (isNaN(mts) || mts <= 0) {
          newErrors.push(t('addAssetScreen.errors.squareMtsInvalid'));
        }
      }
    } else if (formData.kind === 'fixed_asset') {
      if (!formData.asset_category_id) {
        newErrors.push(t('addAssetScreen.errors.assetCategoryRequired'));
      }
      if (!formData.commercial_value.trim()) {
        newErrors.push(t('addAssetScreen.errors.commercialValueRequired'));
      } else {
        const value = parseFloat(formData.commercial_value);
        if (isNaN(value) || value <= 0) {
          newErrors.push(t('addAssetScreen.errors.commercialValueInvalid'));
        }
      }
    } else if (formData.kind === 'investment') {
      if (!formData.investment_type) {
        newErrors.push(t('addAssetScreen.errors.investmentTypeRequired'));
      }
      if (!formData.commercial_value.trim()) {
        newErrors.push(t('addAssetScreen.errors.valueRequired'));
      } else {
        const value = parseFloat(formData.commercial_value);
        if (isNaN(value) || value <= 0) {
          newErrors.push(t('addAssetScreen.errors.valueInvalid'));
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
    router.back();
  };

  const handleComplete = async () => {
    if (!accessToken) {
      setErrors([t('addAssetScreen.errors.authTokenMissing')]);
      return;
    }

    setLoading(true);
    try {
      if (formData.kind === 'property') {
        if (isEditMode && params.rawData) {
          const originalData = JSON.parse(params.rawData as string);
          const assetType = formData.property_kind === 'own' ? 'main_home' : 'investment_property';

          const updatePayload = {
            asset: {
              location: formData.location,
              commercial_value: formData.commercial_value.replace(/[^\d]/g, ''),
              unit: formData.unit,
              square_mts: parseInt(formData.square_mts),
              ...(formData.property_kind === 'investment' && { apartment_number: '' }),
            }
          };

          const response = await updateAsset(originalData.id, updatePayload, accessToken, assetType);

          if (response.success) {
            setLoading(false);
            router.push('/(tabs)/patrimony');
          } else {
            console.error('Property update failed:', response.error);
            setErrors([response.error || t('addAssetScreen.errors.assetCreationError')]);
            setLoading(false);
          }
        } else {
          const assetType = formData.property_kind === 'own' ? 'main_home' : 'investment_property';

          const assetData = {
            asset: {
              location: formData.location,
              commercial_value: formData.commercial_value.replace(/[^\d]/g, ''),
              unit: formData.unit,
              square_mts: parseInt(formData.square_mts),
              ...(formData.property_kind === 'investment' && { apartment_number: '' }),
            }
          };

          const response = await createAsset(assetData, accessToken, assetType);

          if (response.success) {
            setLoading(false);
            router.push('/(tabs)/patrimony');
          } else {
            console.error('Property creation failed:', response.error);
            setErrors([response.error || t('addAssetScreen.errors.propertyCreationError')]);
            setLoading(false);
          }
        }
      } else if (formData.kind === 'fixed_asset') {
        const assetData = {
          asset: {
            name: formData.name,
            asset_category_id: parseInt(formData.asset_category_id),
            commercial_value: formData.commercial_value.replace(/[^\d]/g, ''),
            unit: formData.unit,
            kind: formData.kind === 'fixed_asset' ? 'in_use' : formData.kind,
          }
        };

        let response;
        if (isEditMode && params.rawData) {
          const originalData = JSON.parse(params.rawData as string);

          const getAssetType = (originalData: any) => {
            if (originalData.type && originalData.type.startsWith('SavingInstruments::')) {
              return 'saving_instrument';
            }
            if (originalData.location || originalData.square_mts || originalData.apartment_number !== undefined) {
              return 'investment_property';
            }
            return 'fixed_asset';
          };

          const assetType = getAssetType(originalData);
          response = await updateAsset(originalData.id, assetData, accessToken, assetType);
        } else {
          response = await createAsset(assetData, accessToken);
        }

        if (response.success) {
          setLoading(false);
          router.push('/(tabs)/patrimony');
        } else {
          console.error('Asset operation failed:', response.error);
          setErrors([response.error || t('addAssetScreen.errors.assetCreationError')]);
          setLoading(false);
        }
      } else if (formData.kind === 'investment') {
        const { createSavingInstrument } = await import('@/services/investment/saving-instruments/create-saving-instrument');
        const totalAmount = formatValue(formData.commercial_value || '');

        let payload: any | null = null;
        let validationError: string | null = null;

        switch (formData.investment_type) {
          case 'crowdfunding': {
            if (!formData.crowdfunding_institution || !formData.crowdfunding_credit_id || !formData.due_date) {
              validationError = t('addAssetScreen.errors.crowdfundingValidation');
              break;
            }
            payload = {
              saving_instrument: {
                kind: 'crowdfunding',
                name: formData.name,
                total_amount: totalAmount,
                unit: formData.unit,
                crowdfunding_institution_id: Number(formData.crowdfunding_institution),
                crowdfunding_credit_id: String(formData.crowdfunding_credit_id),
                period_return_rate: formData.period_return_rate ? Number(formData.period_return_rate) : undefined,
                due_date: formData.due_date,
              },
            };
            break;
          }
          case 'mutual_fund_instrument': {
            if (!formData.fund) {
              validationError = t('addAssetScreen.errors.mutualFundRequired');
              break;
            }
            const [fk, fid] = formData.fund.split('@');
            payload = {
              saving_instrument: {
                kind: 'mutual_fund_instrument',
                name: formData.name,
                total_amount: totalAmount,
                unit: formData.unit,
                fund_kind: (fk as 'investment' | 'mutual') || 'mutual',
                fund_id: `${fk}@${fid}`,
                fund_series_id: formData.series || undefined,
                mutual_fund_manager_id: formData.mutual_fund_manager_id ? Number(formData.mutual_fund_manager_id) : undefined,
                comments: formData.comments || undefined,
              },
            };
            break;
          }
          case 'cryptocurrency': {
            payload = {
              saving_instrument: {
                kind: 'cryptocurrency',
                name: formData.name,
                total_amount: totalAmount,
                unit: formData.unit,
                comments: formData.description || formData.comments || undefined,
              },
            };
            break;
          }
          case 'other': {
            payload = {
              saving_instrument: {
                kind: 'another',
                name: formData.name,
                total_amount: totalAmount,
                unit: formData.unit,
                comments: formData.comments || formData.description || undefined,
              },
            };
            break;
          }
          case 'investment_fund': {
            payload = {
              saving_instrument: {
                kind: 'shares',
                name: formData.name,
                total_amount: totalAmount,
                unit: formData.unit,
                comments: formData.brokerage ? `Corredora: ${formData.brokerage}` : undefined,
              },
            };
            break;
          }
          case 'cash_account': {
            if (!formData.brokerage) {
              validationError = t('addAssetScreen.errors.brokerageRequired');
              break;
            }
            payload = {
              saving_instrument: {
                kind: 'cash_account',
                name: formData.name,
                total_amount: totalAmount,
                unit: formData.unit,
                broker_id: Number(formData.brokerage),
              },
            };
            break;
          }
          case 'checking_account': {
            if (!formData.bank) {
              validationError = t('addAssetScreen.errors.bankRequired');
              break;
            }
            payload = {
              saving_instrument: {
                kind: 'checking_account',
                name: formData.name,
                total_amount: totalAmount,
                unit: formData.unit,
                bank_id: Number(formData.bank),
              },
            };
            break;
          }
          case 'saving_account': {
            if (!formData.bank) {
              validationError = t('addAssetScreen.errors.bankRequired');
              break;
            }
            payload = {
              saving_instrument: {
                kind: 'saving_account',
                name: formData.name,
                total_amount: totalAmount,
                unit: formData.unit,
                bank_id: Number(formData.bank),
              },
            };
            break;
          }
          case 'fixed_term_deposit': {
            if (!formData.bank || !formData.deposit_type) {
              validationError = t('addAssetScreen.errors.depositRequired');
              break;
            }
            payload = {
              saving_instrument: {
                kind: 'fixed_term_deposit',
                name: formData.name,
                total_amount: totalAmount,
                unit: formData.unit,
                bank_id: Number(formData.bank),
                deposit_kind: formData.deposit_type,
                start_date: formData.opening_date || undefined,
                end_date: formData.maturity_date || undefined,
              },
            };
            break;
          }
          case 'afp_account_two': {
            if (!formData.institution) {
              validationError = t('addAssetScreen.errors.afpRequired');
              break;
            }
            const mapFundCode = (code: string) => {
              switch (code) {
                case 'fondo_a': return 'A';
                case 'fondo_b': return 'B';
                case 'fondo_c': return 'C';
                case 'fondo_d': return 'D';
                case 'fondo_e': return 'E';
                default: return undefined as unknown as string;
              }
            };
            const funds: Record<string, { code: string; percentage: string }> = {};
            if (formData.fund1 && formData.fund1_percentage) {
              const f1 = mapFundCode(formData.fund1);
              if (f1) funds['1'] = { code: f1, percentage: formData.fund1_percentage };
            }
            if (formData.fund2 && formData.fund2_percentage) {
              const f2 = mapFundCode(formData.fund2);
              if (f2) funds['2'] = { code: f2, percentage: formData.fund2_percentage };
            }
            payload = {
              saving_instrument: {
                kind: 'afp_account_two',
                name: formData.name,
                total_amount: totalAmount,
                unit: formData.unit,
                afp_institution_id: Number(formData.institution),
                tax_regime: formData.tax_regime || undefined,
                funds: Object.keys(funds).length ? funds : undefined,
              },
            };
            break;
          }
          case 'apv_account': {
            if (!formData.institution) {
              validationError = t('addAssetScreen.errors.apvRequired');
              break;
            }
            const mapFundCode = (code: string) => {
              switch (code) {
                case 'fondo_a': return 'A';
                case 'fondo_b': return 'B';
                case 'fondo_c': return 'C';
                case 'fondo_d': return 'D';
                case 'fondo_e': return 'E';
                default: return undefined as unknown as string;
              }
            };
            const funds: Record<string, { code: string; percentage: string }> = {};
            if (formData.fund1 && formData.fund1_percentage) {
              const f1 = mapFundCode(formData.fund1);
              if (f1) funds['1'] = { code: f1, percentage: formData.fund1_percentage };
            }
            if (formData.fund2 && formData.fund2_percentage) {
              const f2 = mapFundCode(formData.fund2);
              if (f2) funds['2'] = { code: f2, percentage: formData.fund2_percentage };
            }
            payload = {
              saving_instrument: {
                kind: 'apv_account',
                name: formData.name,
                total_amount: totalAmount,
                unit: formData.unit,
                apv_institution_id: Number(formData.institution),
                tax_regime: formData.tax_regime || undefined,
                funds: Object.keys(funds).length ? funds : undefined,
              },
            };
            break;
          }
          default: {
            validationError = t('addAssetScreen.errors.unsupportedInvestment');
          }
        }

        if (validationError) {
          setErrors([validationError]);
          setLoading(false);
          return;
        }

        const response = await createSavingInstrument(payload, accessToken);
        
        if (response.success) {
          setLoading(false);
          router.push('/(tabs)/patrimony');
        } else {
          console.error('Saving instrument creation failed:', response.error);
          setErrors([response.error || t('addAssetScreen.errors.savingCreationError')]);
          setLoading(false);
        }
      }
    } catch (error) {
      setErrors([t('addAssetScreen.errors.unexpectedError')]);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormLayout
      title={isEditMode ? t('editAssetScreen.title', 'Editar Activo') : t('addAssetScreen.title')}
      subtitle={isEditMode ? t('editAssetScreen.subtitle', 'Modifica la información de tu activo') : t('addAssetScreen.subtitle')}
      currentStep={1}
      totalSteps={1}
      onNext={handleSubmit}
      onCancel={handleCancel}
      nextButtonTitle={isEditMode ? t('editAssetScreen.save_button', 'Guardar cambios') : t('addAssetScreen.next_button')}
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
          {t('addAssetScreen.fields.name_label')}
        </Text>
        <Input
          placeholder={t('addAssetScreen.fields.name_placeholder')}
          value={formData.name}
          onChangeText={(value) => handleInputChange('name', value)}
          autoCapitalize="words"
        />
      </View>

      <View>
        <Select
          label={t('addAssetScreen.fields.asset_kind_label')}
          options={ASSET_KIND_OPTIONS}
          value={formData.kind}
          onSelect={(value) => handleSelectChange('kind', value)}
          placeholder={t('addAssetScreen.fields.asset_kind_placeholder')}
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
        <SavingInstrumentFields
          investment_type={formData.investment_type}
          institution={formData.institution}
          fund1={formData.fund1}
          fund1_percentage={formData.fund1_percentage}
          fund2={formData.fund2}
          fund2_percentage={formData.fund2_percentage}
          tax_regime={formData.tax_regime}
          commercial_value={formData.commercial_value}
          unit={formData.unit}
          name={formData.name}
          brokerage={formData.brokerage}
          bank={formData.bank}
          platform={formData.platform}
          description={formData.description}
          crowdfunding_institution={formData.crowdfunding_institution}
          crowdfunding_credit_id={formData.crowdfunding_credit_id}
          period_return_rate={formData.period_return_rate}
          due_date={formData.due_date}
          deposit_type={formData.deposit_type}
          opening_date={formData.opening_date}
          maturity_date={formData.maturity_date}
          fund={formData.fund}
          series={formData.series}
          comments={formData.comments}
          onInputChange={handleInputChange}
          onSelectChange={handleSelectChange}
          onNumericInputChange={handleNumericInputChange}
          formatValue={formatValue}
        />
      ) : null}
    </FormLayout>
  );
} 