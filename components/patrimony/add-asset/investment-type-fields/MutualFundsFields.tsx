import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Input, Select } from '@/components/ui';
import Colors from '@/constants/Colors';
import { getSavingInstrumentsFunds } from '@/services/investment/saving-instruments/get-saving-instruments-funds';
import { useAuth } from '@/providers/AuthProvider';
import type { ApiSavingInstrumentFund } from '@/types/api';

interface MutualFundsFieldsProps {
  institution: string;
  commercial_value: string;
  unit: string;
  name: string;
  fund: string;
  series: string;
  onInputChange: (field: string, value: string) => void;
  onSelectChange: (field: string, value: string) => void;
  onNumericInputChange: (field: string, value: string) => void;
  formatValue: (value: string) => string;
}


const UNIT_OPTIONS = [
  { label: 'CLP', value: 'clp' },
  { label: 'USD', value: 'usd' },
  { label: 'UF', value: 'uf' },
];

export default function MutualFundsFields({
  institution,
  commercial_value,
  unit,
  name,
  fund,
  series,
  onInputChange,
  onSelectChange,
  onNumericInputChange,
  formatValue
}: MutualFundsFieldsProps) {

  const ADMINISTRATOR_OPTIONS = [
    { label: 'ADMINISTRADORA GENERAL DE FONDOS SECURITY S.A.', value: '22' },
    { label: 'ADMINISTRADORA GENERAL DE FONDOS SURA S.A.', value: '23' },
    { label: 'ALTIS S.A. ADMINISTRADORA GENERAL DE FONDOS', value: '24' },
    { label: 'ALZA ADMINISTRADORA GENERAL DE FONDOS S.A.', value: '25' },
    { label: 'AMERIS CAPITAL ADMINISTRADORA GENERAL DE FONDOS S.A.', value: '26' },
    { label: 'ASSET ADMINISTRADORA GENERAL DE FONDOS S.A.', value: '27' },
    { label: 'AVANTE ADMINISTRADORA GENERAL DE FONDOS S.A.', value: '28' },
    { label: 'AZIMUT INVESTMENTS S.A. ADMINISTRADORA GENERAL DE FONDOS', value: '29' },
    { label: 'BANCHILE ADMINISTRADORA GENERAL DE FONDOS S.A.', value: '30' },
    { label: 'BANCO INTERNACIONAL ADMINISTRADORA GENERAL DE FONDOS S.A.', value: '31' },
    { label: 'BANCOESTADO S.A. ADMINISTRADORA GENERAL DE FONDOS', value: '32' },
    { label: 'BCI ASSET MANAGEMENT ADMINISTRADORA GENERAL DE FONDOS S.A.', value: '33' },
    { label: 'BICE INVERSIONES ADMINISTRADORA GENERAL DE FONDOS S.A.', value: '34' },
    { label: 'BTG PACTUAL CHILE S.A. ADMINISTRADORA GENERAL DE FONDOS', value: '35' },
    { label: 'CAPITAL ADVISORS ADMINISTRADORA GENERAL DE FONDOS S.A.', value: '36' },
    { label: 'CIMENTA S.A. ADMINISTRADORA GENERAL DE FONDOS', value: '37' },
    { label: 'CMB-PRIME ADMINISTRADORA GENERAL DE FONDOS S.A.', value: '38' },
    { label: 'COMPASS GROUP CHILE S.A. ADMINISTRADORA GENERAL DE FONDOS', value: '39' },
    { label: 'CREDICORP CAPITAL ASSET MANAGEMENT S.A. ADMINISTRADORA GENERAL DE FONDOS', value: '40' },
    { label: 'ECONSULT ADMINISTRADORA GENERAL DE FONDOS S.A.', value: '41' },
    { label: 'ECUS ADMINISTRADORA GENERAL DE FONDOS S.A.', value: '42' },
    { label: 'FALCOM ADMINISTRADORA GENERAL DE FONDOS S.A.', value: '43' },
    { label: 'FINASSET ADMINISTRADORA GENERAL DE FONDOS S.A.', value: '44' },
    { label: 'FINTUAL ADMINISTRADORA GENERAL DE FONDOS S.A.', value: '45' },
    { label: 'FRONTAL TRUST ADMINISTRADORA GENERAL DE FONDOS S.A.', value: '46' },
    { label: 'FYNSA ADMINISTRADORA GENERAL DE FONDOS S.A.', value: '47' },
    { label: 'HMC S.A. ADMINISTRADORA GENERAL DE FONDOS', value: '48' },
    { label: 'INDEPENDENCIA ADMINISTRADORA GENERAL DE FONDOS S.A.', value: '49' },
    { label: 'INDEPENDENCIA INTERNACIONAL ADMINISTRADORA GENERAL DE FONDOS S.A.', value: '50' },
    { label: 'INVERLINK ADMINISTRADORA GENERAL DE FONDOS S.A.', value: '51' },
    { label: 'ITAU ADMINISTRADORA GENERAL DE FONDOS S.A.', value: '52' },
    { label: 'LARRAIN VIAL ACTIVOS S.A. ADMINISTRADORA GENERAL DE FONDOS', value: '53' },
    { label: 'LARRAINVIAL ASSET MANAGEMENT ADMINISTRADORA GENERAL DE FONDOS S.A.', value: '54' },
    { label: 'LINK CAPITAL PARTNERS ADMINISTRADORA GENERAL DE FONDOS S.A.', value: '55' },
    { label: 'MBI ADMINISTRADORA GENERAL DE FONDOS S.A.', value: '56' },
    { label: 'MONEDA S.A. ADMINISTRADORA GENERAL DE FONDOS', value: '57' },
    { label: 'NEORENTAS S.A. ADMINISTRADORA GENERAL DE FONDOS', value: '58' },
    { label: 'NEVASA ADMINISTRADORA GENERAL DE FONDOS S.A.', value: '59' },
    { label: 'PENTA LAS AMERICAS ADMINISTRADORA GENERAL DE FONDOS S.A.', value: '60' },
    { label: 'PICTON ADMINISTRADORA GENERAL DE FONDOS S.A.', value: '61' },
    { label: 'PRINCIPAL ADMINISTRADORA GENERAL DE FONDOS S.A.', value: '62' },
    { label: 'QUEST ADMINISTRADORA GENERAL DE FONDOS S.A.', value: '63' },
    { label: 'SANTANDER ASSET MANAGEMENT S.A. ADMINISTRADORA GENERAL DE FONDOS', value: '64' },
    { label: 'SARTOR ADMINISTRADORA GENERAL DE FONDOS S.A.', value: '65' },
    { label: 'SCOTIA ADMINISTRADORA GENERAL DE FONDOS CHILE S.A.', value: '66' },
    { label: 'SENSOR CAPITAL S.A. ADMINISTRADORA GENERAL DE FONDOS', value: '67' },
    { label: 'SINGULAR ASSET MANAGEMENT ADMINISTRADORA GENERAL DE FONDOS S.A.', value: '68' },
    { label: 'SOYFOCUS ADMINISTRADORA GENERAL DE FONDOS S.A.', value: '69' },
    { label: 'TAURUS ADMINISTRADORA GENERAL DE FONDOS S.A.', value: '70' },
    { label: 'TOESCA S.A. ADMINISTRADORA GENERAL DE FONDOS', value: '71' },
    { label: 'VANTRUST CAPITAL ADMINISTRADORA GENERAL DE FONDOS S.A.', value: '72' },
    { label: 'VENTURANCE S.A. ADMINISTRADORA GENERAL DE FONDOS', value: '73' },
    { label: 'VOLCOMCAPITAL ADMINISTRADORA GENERAL DE FONDOS S.A.', value: '74' },
    { label: 'WEG ADMINISTRADORA GENERAL DE FONDOS S.A.', value: '75' },
    { label: 'XLC ADMINISTRADORA GENERAL DE FONDOS S.A.', value: '76' },
    { label: 'ZURICH CHILE ASSET MANAGEMENT ADMINISTRADORA GENERAL DE FONDOS S.A.', value: '77' },
  ];
  const { accessToken } = useAuth();
  const [funds, setFunds] = useState<ApiSavingInstrumentFund[]>([]);
  const [loadingFunds, setLoadingFunds] = useState(false);
  const [fundsError, setFundsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFunds = async () => {
      if (!accessToken) {
        setFundsError('No hay token de autenticación disponible');
        return;
      }

      setLoadingFunds(true);
      setFundsError(null);

      try {
        console.log('🔍 Fetching funds with token:', accessToken ? 'Token available' : 'No token');
        console.log('🔍 Token length:', accessToken?.length);
        
        const response = await getSavingInstrumentsFunds(accessToken, {
          page: 1,
          per_page: 100
        });

        console.log('📊 Funds response:', response);

        if (!response) {
          console.log('❌ No response received');
          setFundsError('No se recibió respuesta del servidor');
          return;
        }

        if (!response.success) {
          console.log('❌ Response not successful:', response);
          setFundsError('La respuesta del servidor no fue exitosa');
          return;
        }

        if (!response.data) {
          console.log('❌ No data property in response:', response);
          setFundsError('Estructura de respuesta inválida');
          return;
        }

        const allFunds = [
          ...(response.data.investment_funds || []),
          ...(response.data.mutual_funds || [])
        ];

        if (allFunds.length === 0) {
          setFundsError('No hay fondos disponibles');
          return;
        }

        setFunds(allFunds);

      } catch (error) {
        console.error('❌ Error fetching funds:', error);
        setFundsError(`Error al cargar los fondos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      } finally {
        setLoadingFunds(false);
      }
    };

    fetchFunds();
  }, [accessToken]);

  const fundOptions = funds.map(fundItem => ({
    label: fundItem.name,
    value: fundItem.id.toString()
  }));

  const selectedFund = useMemo(() => funds.find((f) => f.id.toString() === fund), [funds, fund]);
  const [seriesOptions, setSeriesOptions] = useState<Array<{ label: string; value: string }>>([]);

  useEffect(() => {
    const seriesSource = (selectedFund && (selectedFund as any).series)
      || (selectedFund && (selectedFund as any).fund_series)
      || [];
    const mapped = (seriesSource as Array<{ id: number; name: string }>).map((s) => ({
      label: s.name,
      value: s.id.toString(),
    }));
    setSeriesOptions(mapped);
  }, [selectedFund]);

  return (
    <>
      <View>
        <Text className='text-base font-medium'
          style={{
            color: Colors.primary[500],
            marginBottom: 8,
          }}
        >
          ¿Cuál es la administradora?
        </Text>
        <Select
          options={ADMINISTRATOR_OPTIONS}
          value={institution}
          onSelect={(value) => onSelectChange('institution', value)}
          placeholder="Selecciona administradora"
        />
      </View>

      <View>
        <Text className='text-base font-medium'
          style={{
            color: Colors.primary[500],
            marginBottom: 8,
          }}
        >
          ¿Cuál es el fondo?
        </Text>
        {loadingFunds ? (
          <View style={{ padding: 16, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={Colors.primary[500]} />
          </View>
        ) : fundsError ? (
          <View style={{ padding: 16, alignItems: 'center' }}>
            <Text style={{ color: Colors.error[500] }}>
              {fundsError}
            </Text>
          </View>
        ) : (
          <Select
            options={fundOptions}
            value={fund}
            onSelect={(value) => {
              onSelectChange('fund', value);
              onSelectChange('series', '');
              onSelectChange('fund_series_id', '');
              const selected = funds.find((f) => f.id.toString() === value);
              if (selected?.kind) {
                onSelectChange('fund_kind', selected.kind);
                onSelectChange('fund_id', `${selected.kind}@${value}`);
              }
            }}
            placeholder="Selecciona un fondo"
          />
        )}
      </View>

      {fund && (
        <>
          <View>
            <Text className='text-base font-medium'
              style={{
                color: Colors.primary[500],
                marginBottom: 8,
              }}
            >
              ¿En cuál serie tienes el ahorro o inversión?
            </Text>
            <Select
              options={seriesOptions}
              value={series}
              onSelect={(value) => {
                onSelectChange('series', value);
                onSelectChange('fund_series_id', value);
              }}
              placeholder={seriesOptions.length > 0 ? 'Selecciona la serie' : 'Sin serie disponible'}
              disabled={seriesOptions.length === 0}
            />
          </View>

          <View>
            <Text className='text-base font-medium'
              style={{
                color: Colors.primary[500],
                marginBottom: 8,
              }}
            >
              ¿Cuál es el saldo actual?
            </Text>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ width: 100, marginRight: 8 }}>
                <Select
                  options={UNIT_OPTIONS}
                  value={unit}
                  onSelect={(value) => onSelectChange('unit', value)}
                  placeholder="Moneda"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  placeholder="$0"
                  value={commercial_value ? formatValue(commercial_value) : ''}
                  onChangeText={(value) => onNumericInputChange('commercial_value', value)}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>  
        </>
      )}
    </>
  );
}
