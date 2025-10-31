import React from 'react';
import { View } from 'react-native';
import { Select } from '@/components/ui';
import {
  AFP2Fields,
  APVFields,
  CashFields,
  CheckingAccountFields,
  CrowdfundingFields,
  CryptoFields,
  MutualFundsFields,
  OthersFields,
  SavingsAccountFields,
  StocksFields,
  TermsFields,
} from './investment-type-fields';

interface SavingInstrumentFieldsProps {
  investment_type: string;
  institution?: string;
  fund1?: string;
  fund1_percentage?: string;
  fund2?: string;
  fund2_percentage?: string;
  tax_regime?: string;
  commercial_value: string;
  unit: string;
  name: string;
  brokerage?: string;
  bank?: string;
  platform?: string;
  description?: string;
  // crowdfunding specifics
  crowdfunding_institution?: string;
  crowdfunding_credit_id?: string;
  period_return_rate?: string;
  due_date?: string;
  deposit_type?: string;
  opening_date?: string;
  maturity_date?: string;
  fund?: string;
  fund_kind?: string;
  fund_id?: string;
  fund_series_id?: string;
  series?: string;
  comments?: string;
  isEditMode?: boolean;
  onInputChange: (field: string, value: string) => void;
  onSelectChange: (field: string, value: string) => void;
  onNumericInputChange: (field: string, value: string) => void;
  formatValue: (value: string) => string;
}

const INVESTMENT_TYPE_OPTIONS = [
  { label: 'Cuenta 2 AFP', value: 'afp_account_two' },
  { label: 'Cuenta APV', value: 'apv_account' },
  { label: 'Cuenta Caja', value: 'cash_account' },
  { label: 'Cuenta Corriente', value: 'checking_account' },
  { label: 'Crowdfunding', value: 'crowdfunding' },
  { label: 'Criptomonedas', value: 'cryptocurrency' },
  { label: 'Depósito a plazo', value: 'fixed_term_deposit' },
  { label: 'Cuenta de ahorros', value: 'saving_account' },
  { label: 'Acciones', value: 'investment_fund' },
  { label: 'Fondos Mutuos o de Inversión', value: 'mutual_fund_instrument' },
  { label: 'Otros', value: 'other' },
];

export default function SavingInstrumentFields({
  investment_type,
  institution = '',
  fund1 = '',
  fund1_percentage = '',
  fund2 = '',
  fund2_percentage = '',
  tax_regime = '',
  commercial_value,
  unit,
  name,
  brokerage = '',
  bank = '',
  platform = '',
  description = '',
  crowdfunding_institution = '',
  crowdfunding_credit_id = '',
  period_return_rate = '',
  due_date = '',
  deposit_type = '',
  opening_date = '',
  maturity_date = '',
  fund = '',
  fund_kind = '',
  fund_id = '',
  fund_series_id = '',
  series = '',
  comments = '',
  isEditMode = false,
  onInputChange,
  onSelectChange,
  onNumericInputChange,
  formatValue
}: SavingInstrumentFieldsProps) {
  const renderSpecificFields = () => {
    switch (investment_type) {
      case 'afp_account_two':
        return (
          <AFP2Fields
            institution={institution}
            commercial_value={commercial_value}
            unit={unit}
            fund1={fund1}
            fund1_percentage={fund1_percentage}
            fund2={fund2}
            fund2_percentage={fund2_percentage}
            tax_regime={tax_regime}
            name={name}
            onInputChange={onInputChange}
            onSelectChange={onSelectChange}
            onNumericInputChange={onNumericInputChange}
            formatValue={formatValue}
          />
        );
      case 'apv_account':
        return (
          <APVFields
            institution={institution}
            commercial_value={commercial_value}
            unit={unit}
            fund1={fund1}
            fund1_percentage={fund1_percentage}
            fund2={fund2}
            fund2_percentage={fund2_percentage}
            tax_regime={tax_regime}
            name={name}
            onInputChange={onInputChange}
            onSelectChange={onSelectChange}
            onNumericInputChange={onNumericInputChange}
            formatValue={formatValue}
          />
        );
      case 'cash_account':
        return (
          <CashFields
            brokerage={brokerage}
            commercial_value={commercial_value}
            unit={unit}
            name={name}
            onInputChange={onInputChange}
            onSelectChange={onSelectChange}
            onNumericInputChange={onNumericInputChange}
            formatValue={formatValue}
          />
        );
      case 'checking_account':
        return (
          <CheckingAccountFields
            bank={bank}
            commercial_value={commercial_value}
            unit={unit}
            name={name}
            onInputChange={onInputChange}
            onSelectChange={onSelectChange}
            onNumericInputChange={onNumericInputChange}
            formatValue={formatValue}
          />
        );
      case 'crowdfunding':
        return (
          <CrowdfundingFields
            crowdfunding_institution={crowdfunding_institution}
            crowdfunding_credit_id={crowdfunding_credit_id}
            period_return_rate={period_return_rate}
            due_date={due_date}
            commercial_value={commercial_value}
            unit={unit}
            name={name}
            onInputChange={onInputChange}
            onSelectChange={onSelectChange}
            onNumericInputChange={onNumericInputChange}
            formatValue={formatValue}
          />
        );
      case 'cryptocurrency':
        return (
          <CryptoFields
            platform={platform}
            commercial_value={commercial_value}
            unit={unit}
            name={name}
            onInputChange={onInputChange}
            onSelectChange={onSelectChange}
            onNumericInputChange={onNumericInputChange}
            formatValue={formatValue}
          />
        );
      case 'fixed_term_deposit':
        return (
          <TermsFields
            bank={bank}
            commercial_value={commercial_value}
            unit={unit}
            name={name}
            deposit_type={deposit_type}
            opening_date={opening_date}
            maturity_date={maturity_date}
            onInputChange={onInputChange}
            onSelectChange={onSelectChange}
            onNumericInputChange={onNumericInputChange}
            formatValue={formatValue}
          />
        );
      case 'saving_account':
        return (
          <SavingsAccountFields
            bank={bank}
            commercial_value={commercial_value}
            unit={unit}
            name={name}
            onInputChange={onInputChange}
            onSelectChange={onSelectChange}
            onNumericInputChange={onNumericInputChange}
            formatValue={formatValue}
          />
        );
      case 'investment_fund':
        return (
          <StocksFields
            brokerage={brokerage}
            commercial_value={commercial_value}
            unit={unit}
            name={name}
            onInputChange={onInputChange}
            onSelectChange={onSelectChange}
            onNumericInputChange={onNumericInputChange}
            formatValue={formatValue}
          />
        );
      case 'mutual_fund_instrument':
        return (
          <MutualFundsFields
            institution={institution}
            commercial_value={commercial_value}
            unit={unit}
            name={name}
            fund={fund}
            fund_kind={fund_kind}
            series={series || ''}
            onInputChange={onInputChange}
            onSelectChange={onSelectChange}
            onNumericInputChange={onNumericInputChange}
            formatValue={formatValue}
          />
        );
      case 'other':
        return (
          <OthersFields
            commercial_value={commercial_value}
            unit={unit}
            name={name}
            description={description}
            comments={comments}
            onInputChange={onInputChange}
            onSelectChange={onSelectChange}
            onNumericInputChange={onNumericInputChange}
            formatValue={formatValue}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View>
      <Select
        label="¿Qué tipo de ahorro o inversión tienes?"
        options={INVESTMENT_TYPE_OPTIONS}
        value={investment_type}
        onSelect={(value) => onSelectChange('investment_type', value)}
        placeholder="Selecciona el tipo de inversión"
        disabled={isEditMode}
      />

      {investment_type && renderSpecificFields()}
    </View>
  );
} 