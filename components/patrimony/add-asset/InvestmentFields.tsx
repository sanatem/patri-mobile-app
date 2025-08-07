import React from 'react';
import { View } from 'react-native';
import { Select } from '@/components/ui';

interface InvestmentFieldsProps {
  investment_type: string;
  onSelectChange: (field: string, value: string) => void;
}

const INVESTMENT_TYPE_OPTIONS = [
  { label: 'Cuenta 2 AFP', value: 'cuenta_2_afp' },
  { label: 'Cuenta APV', value: 'cuenta_apv' },
  { label: 'Cuenta Caja', value: 'cuenta_caja' },
  { label: 'Cuenta Corriente', value: 'cuenta_corriente' },
  { label: 'Crowdfunding', value: 'crowdfunding' },
  { label: 'Criptomonedas', value: 'criptomonedas' },
  { label: 'Depósito a plazo', value: 'deposito_plazo' },
  { label: 'Cuenta de ahorros', value: 'cuenta_ahorros' },
  { label: 'Acciones', value: 'acciones' },
  { label: 'Fondos Mutuos o de Inversión', value: 'fondos_mutuos' },
  { label: 'Otros', value: 'otros' },
];

export default function InvestmentFields({ investment_type, onSelectChange }: InvestmentFieldsProps) {
  return (
    <View>
      <Select
        label="¿Qué tipo de ahorro o inversión tienes?"
        options={INVESTMENT_TYPE_OPTIONS}
        value={investment_type}
        onSelect={(value) => onSelectChange('investment_type', value)}
        placeholder="Selecciona el tipo de inversión"
      />
    </View>
  );
} 