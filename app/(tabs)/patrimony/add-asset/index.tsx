import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
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
import { getAssetDetail } from '@/services/patrimony/get-asset-detail';
import { getSavingInstrumentDetail } from '@/services/investment/saving-instruments/get-saving-instrument-detail';
import { useAuth } from '@/providers/AuthProvider';
import { useFormatValue } from '@/hooks/common/useFormatValue';
import { FixedAssetFields, PropertyFields, SavingInstrumentFields } from '@/components/patrimony/add-asset';
import { useTranslation } from 'react-i18next';
import { useAssetEditStore } from '@/store/assetEditStore';

export default function AddAssetScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const { editData, clearEditData } = useAssetEditStore();

  const rawEditMode = (editData?.editMode ?? params.editMode);
  const isEditMode =
    rawEditMode === true ||
    rawEditMode === 'true' ||
    rawEditMode === '1';
  const assetId =
    editData?.itemId ?? (typeof params.assetId === 'string' ? Number(params.assetId) : undefined);
  const assetTypeParam =
    (editData?.itemType as string | undefined) ??
    (typeof params.assetType === 'string' ? params.assetType : undefined);

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
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [loadingInitialData, setLoadingInitialData] = useState(false);

  useEffect(() => {
    if (errors.length === 0 && loading) {
      setLoading(false);
    }
  }, [errors, loading]);

  useEffect(() => {
    return () => {
      clearEditData();
    };
  }, [clearEditData]);

  useEffect(() => {
    const loadAssetDetail = async () => {
      if (!isEditMode || !assetId || !accessToken || !assetTypeParam) return;

      const validDebtTypes = ['credit_card', 'consumer_credit', 'automotive_credit', 'commercial_credit', 'mortgage_credit', 'mortgage', 'credit_line', 'family_loan', 'other'];
      if (validDebtTypes.includes(assetTypeParam)) {
        console.log('Tipo no válido para asset, ignorando carga:', assetTypeParam);
        return;
      }

      setLoadingInitialData(true);
      try {
        let assetData;

        if (assetTypeParam === 'saving_instrument') {
          assetData = await getSavingInstrumentDetail(accessToken, assetId);
        } else {
          assetData = await getAssetDetail(accessToken, assetId, assetTypeParam as any);
        }

        if (!assetData) {
          console.error('No asset data returned');
          return;
        }

        const getCategoryId = (categoryName: string) => {
          switch(categoryName) {
            case 'Auto o moto': return '1';
            case 'Terreno': return '2';
            case 'Otros': return '3';
            default: return '3';
          }
        };

        const mapSavingInstrumentType = (type: string) => {
          switch(type) {
            case 'SavingInstruments::CheckingAccount': return 'checking_account';
            case 'SavingInstruments::SavingAccount': return 'saving_account';
            case 'SavingInstruments::FixedTermDeposit': return 'fixed_term_deposit';
            case 'SavingInstruments::AfpAccountTwo': return 'afp_account_two';
            case 'SavingInstruments::ApvAccount': return 'apv_account';
            case 'SavingInstruments::CashAccount': return 'cash_account';
            case 'SavingInstruments::Crowdfunding': return 'crowdfunding';
            case 'SavingInstruments::Cryptocurrency': return 'cryptocurrency';
            case 'SavingInstruments::Share': return 'investment_fund';
            case 'SavingInstruments::InvestmentFund': return 'mutual_fund_instrument';
            case 'SavingInstruments::MutualFundInstrument': return 'mutual_fund_instrument';
            case 'SavingInstruments::OtherSavingInstrument': return 'other';
            default: return '';
          }
        };

        let assetKind = 'fixed_asset';
        let baseFormData = {
          name: assetData.name || '',
          asset_category_id: assetData.asset_category_id?.toString() || getCategoryId(assetData.category || ''),
          commercial_value: assetData.commercial_value?.toString() || assetData.total_amount?.toString() || '',
          unit: assetData.unit || 'clp',
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
          comments: assetData.comments || '',
        };

        if (assetData.type && assetData.type.startsWith('SavingInstruments::')) {
          assetKind = 'investment';
          baseFormData.kind = 'investment';
          baseFormData.investment_type = mapSavingInstrumentType(assetData.type);
          baseFormData.commercial_value = assetData.total_amount?.toString() || '';

          try {
            const detailData = await getSavingInstrumentDetail(accessToken, assetId);
            if (detailData) {
              baseFormData.name = detailData.name || baseFormData.name;
              baseFormData.commercial_value = detailData.total_amount?.toString() || baseFormData.commercial_value;
              baseFormData.unit = detailData.unit || baseFormData.unit;

              const actable = detailData.actable;

              if (actable.crowdfunding_institution_id) {
                baseFormData.crowdfunding_institution = actable.crowdfunding_institution_id?.toString() || '';
                baseFormData.crowdfunding_credit_id = actable.crowdfunding_credit_id?.toString() || '';
                baseFormData.period_return_rate = actable.period_return_rate?.toString() || '';
                baseFormData.due_date = actable.due_date || '';
              }

              if (actable.afp_institution_id || actable.apv_institution_id) {
                baseFormData.institution = (actable.afp_institution_id || actable.apv_institution_id)?.toString() || '';
                baseFormData.tax_regime = actable.tax_regime || '';

                if (actable.funds) {
                  const fundEntries = Object.entries(actable.funds);
                  if (fundEntries.length > 0) {
                    const [fund1Code, fund1Percentage] = fundEntries[0];
                    baseFormData.fund1 = `fondo_${fund1Code.toLowerCase()}`;
                    baseFormData.fund1_percentage = fund1Percentage?.toString() || '';
                  }
                  if (fundEntries.length > 1) {
                    const [fund2Code, fund2Percentage] = fundEntries[1];
                    baseFormData.fund2 = `fondo_${fund2Code.toLowerCase()}`;
                    baseFormData.fund2_percentage = fund2Percentage?.toString() || '';
                  }
                }
              }

              if (actable.bank_id) {
                baseFormData.bank = actable.bank_id?.toString() || '';
                baseFormData.deposit_type = actable.deposit_kind || '';
                baseFormData.opening_date = actable.start_date || '';
                baseFormData.maturity_date = actable.end_date || '';
              }

              if (actable.broker_id) {
                baseFormData.brokerage = actable.broker_id?.toString() || '';
              }

              if (actable.mutual_fund_id || actable.investment_fund_id) {
                const assetClass = actable.mutual_fund_asset_class || 'mutual';
                const fundId = actable.mutual_fund_id || actable.investment_fund_id;
                const seriesId = actable.mutual_fund_series_id || actable.investment_fund_series_id;

                if (fundId) {
                  baseFormData.fund_id = `${assetClass}@${fundId}`;
                  baseFormData.fund = `${assetClass}@${fundId}`;
                  baseFormData.fund_kind = assetClass;
                  baseFormData.fund_series_id = seriesId?.toString() || '';
                  baseFormData.series = seriesId?.toString() || '';
                  baseFormData.mutual_fund_manager_id = actable.mutual_fund_manager_id?.toString() || '';

                }
              }

              const comments = actable.comments || detailData.comments || '';
              if (comments) {
                baseFormData.comments = comments;
                baseFormData.description = comments;
              }
            }
          } catch (error) {
            console.error('Error fetching saving instrument detail:', error);
          }
        }
        else if (assetData.location !== undefined || assetData.square_mts !== undefined || assetTypeParam === 'main_home' || assetTypeParam === 'investment_property') {
          assetKind = 'property';
          baseFormData.kind = 'property';

          let assetType: 'main_home' | 'investment_property' = 'main_home';
          if (assetTypeParam === 'main_home' || assetTypeParam === 'investment_property') {
            assetType = assetTypeParam;
          } else if (assetData.property_type) {
            assetType = assetData.property_type === 'own' ? 'main_home' : 'investment_property';
          } else {
            assetType = assetData.kind === 'leased' || assetData.kind === 'own' ? 'main_home' : 'investment_property';
          }

          try {
            const detailData = await getAssetDetail(accessToken, assetId, assetType);
            if (detailData && 'location' in detailData) {
              baseFormData.location = detailData.location || '';
              baseFormData.square_mts = detailData.square_mts?.toString() || '';
              baseFormData.commercial_value = detailData.commercial_value?.toString() || '';
              baseFormData.property_kind = assetType === 'main_home' ? 'own' : 'rent';
            }
          } catch (error) {
            console.error('Error fetching property detail:', error);
            baseFormData.location = assetData.location || '';
            baseFormData.square_mts = assetData.square_mts?.toString() || '';
            baseFormData.commercial_value = assetData.commercial_value?.toString() || '';
            baseFormData.property_kind = assetType === 'main_home' ? 'own' : 'rent';
          }
        }
        else if (assetData.kind === 'in_use' || assetData.category) {
          assetKind = 'fixed_asset';
          baseFormData.kind = 'fixed_asset';

          try {
            const detailData = await getAssetDetail(accessToken, assetId, 'fixed_asset');
            if (detailData && 'category' in detailData) {
              baseFormData.name = detailData.name || '';
              baseFormData.commercial_value = detailData.commercial_value?.toString() || '';
              baseFormData.unit = detailData.unit || 'clp';
              baseFormData.comments = detailData.comments || '';
              baseFormData.asset_category_id = getCategoryId(detailData.category);
            }
          } catch (error) {
            console.error('Error fetching fixed asset detail:', error);
            baseFormData.commercial_value = assetData.commercial_value?.toString() || '';
          }
        }

        setFormData(baseFormData);
      } catch (error) {
        console.error('Error parsing asset data:', error);
      } finally {
        setLoadingInitialData(false);
      }
    };

    if (isEditMode) {
      loadAssetDetail();
    }
  }, [isEditMode, assetId, accessToken, assetTypeParam]);

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

    if (!formData.name.trim() && formData.kind !== 'property') {
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
    clearEditData();
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
        if (isEditMode && assetId && assetTypeParam) {
          const assetType = assetTypeParam === 'main_home' ? 'main_home' : 'investment_property';

          const updatePayload = {
            asset: {
              location: formData.location,
              commercial_value: formData.commercial_value.replace(/[^\d]/g, ''),
              unit: formData.unit,
              square_mts: parseInt(formData.square_mts),
              ...(assetType === 'investment_property' && { apartment_number: '' }),
            }
          };

          const [response] = await Promise.all([
            updateAsset(assetId, updatePayload, accessToken, assetType),
            new Promise(resolve => setTimeout(resolve, 1000))
          ]);

          if (response.success) {
            setLoading(false);
            setSaved(true);
            setTimeout(() => {
              clearEditData();
              router.push('/(tabs)/patrimony');
            }, 2000);
          } else {
            console.error('Property update failed:', response.error);
            setErrors([response.error || t('addAssetScreen.errors.assetCreationError')]);
            setLoading(false);
          }
        } else {
          const propertyData = {
            property_type: formData.property_kind === 'own' ? 'main_home' as const : 'investment' as const,
            property: {
              kind: formData.property_kind === 'own' ? 'own' as const : '' as const,
              property_attributes: {
                location: formData.location,
                commercial_value: formData.commercial_value.replace(/[^\d]/g, ''),
                unit: formData.unit,
                square_mts: parseInt(formData.square_mts),
              }
            }
          };

          const [response] = await Promise.all([
            createProperty(propertyData, accessToken),
            new Promise(resolve => setTimeout(resolve, 1000))
          ]);

          if (response.success) {
            setLoading(false);
            setSaved(true);
            setTimeout(() => {
              clearEditData();
              router.push('/(tabs)/patrimony');
            }, 2000);
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

        const [response] = await Promise.all([
          isEditMode && assetId && assetTypeParam
            ? updateAsset(assetId, assetData, accessToken, assetTypeParam as any)
            : createAsset(assetData, accessToken),
          new Promise(resolve => setTimeout(resolve, 1000))
        ]);

        if (response.success) {
          setLoading(false);
          setSaved(true);
          setTimeout(() => {
            clearEditData();
            router.push('/(tabs)/patrimony');
          }, 2500);
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

        let response;
        if (isEditMode && assetId) {
          const buildUpdatePayload = (savingInstrument: any) => {
            const basePayload: any = {
              name: savingInstrument.name,
              total_amount: savingInstrument.total_amount,
              unit: savingInstrument.unit,
            };

            switch (formData.investment_type) {
              case 'crowdfunding':
                return {
                  ...basePayload,
                  crowdfunding_institution_id: savingInstrument.crowdfunding_institution_id,
                  crowdfunding_credit_id: savingInstrument.crowdfunding_credit_id,
                  ...(savingInstrument.period_return_rate && { period_return_rate: savingInstrument.period_return_rate }),
                  ...(savingInstrument.due_date && { due_date: savingInstrument.due_date }),
                };
              case 'mutual_fund_instrument':
                return {
                  ...basePayload,
                  fund_kind: savingInstrument.fund_kind,
                  fund_id: savingInstrument.fund_id,
                  ...(savingInstrument.fund_series_id && { fund_series_id: savingInstrument.fund_series_id }),
                  ...(savingInstrument.mutual_fund_manager_id && { mutual_fund_manager_id: savingInstrument.mutual_fund_manager_id }),
                  ...(savingInstrument.comments && { comments: savingInstrument.comments }),
                };
              case 'cash_account':
                return {
                  ...basePayload,
                  broker_id: savingInstrument.broker_id,
                };
              case 'checking_account':
              case 'saving_account':
                return {
                  ...basePayload,
                  bank_id: savingInstrument.bank_id,
                };
              case 'fixed_term_deposit':
                return {
                  ...basePayload,
                  bank_id: savingInstrument.bank_id,
                  deposit_kind: savingInstrument.deposit_kind,
                  ...(savingInstrument.start_date && { start_date: savingInstrument.start_date }),
                  ...(savingInstrument.end_date && { end_date: savingInstrument.end_date }),
                };
              case 'afp_account_two':
                return {
                  ...basePayload,
                  afp_institution_id: savingInstrument.afp_institution_id,
                  ...(savingInstrument.tax_regime && { tax_regime: savingInstrument.tax_regime }),
                  ...(savingInstrument.funds && { funds: savingInstrument.funds }),
                };
              case 'apv_account':
                return {
                  ...basePayload,
                  apv_institution_id: savingInstrument.apv_institution_id,
                  ...(savingInstrument.tax_regime && { tax_regime: savingInstrument.tax_regime }),
                  ...(savingInstrument.funds && { funds: savingInstrument.funds }),
                };
              default:
                return {
                  ...basePayload,
                  ...(savingInstrument.comments && { comments: savingInstrument.comments }),
                };
            }
          };

          const updatePayload = {
            asset: buildUpdatePayload(payload.saving_instrument)
          };

          [response] = await Promise.all([
            updateAsset(assetId, updatePayload, accessToken, 'saving_instrument'),
            new Promise(resolve => setTimeout(resolve, 1000))
          ]);
        } else {
          [response] = await Promise.all([
            createSavingInstrument(payload, accessToken),
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
          console.error('Saving instrument operation failed:', response.error);
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
      isSaved={saved}
      loadingText={isEditMode ? t('common.saving') : t('common.creating')}
      savedText={isEditMode ? t('common.saved') : t('common.created')}
      isNextDisabled={errors.length > 0}
      error={errors.length > 0 ? errors[0] : null}
    >
      {loadingInitialData ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <ActivityIndicator size="large" color={Colors.secondary[500]} />
        </View>
      ) : (
        <>
          {formData.kind !== 'property' && (
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
      )}

      <View>
        <Select
          label={t('addAssetScreen.fields.asset_kind_label')}
          options={ASSET_KIND_OPTIONS}
          value={formData.kind}
          onSelect={(value) => handleSelectChange('kind', value)}
          placeholder={t('addAssetScreen.fields.asset_kind_placeholder')}
          disabled={isEditMode}
        />
      </View>

      {formData.kind === 'property' ? (
        <PropertyFields
          location={formData.location}
          square_mts={formData.square_mts}
          property_kind={formData.property_kind}
          commercial_value={formData.commercial_value}
          unit={formData.unit}
          isEditMode={isEditMode}
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
          isEditMode={isEditMode}
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
          isEditMode={isEditMode}
          onInputChange={handleInputChange}
          onSelectChange={handleSelectChange}
          onNumericInputChange={handleNumericInputChange}
          formatValue={formatValue}
        />
      ) : null}
        </>
      )}
    </FormLayout>
  );
} 