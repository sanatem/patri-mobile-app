import React, { useEffect, useState } from 'react';
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

// Series options will be built dynamically from selected fund

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
          per_page: 100 // Obtener todos los fondos disponibles
        });

        console.log('📊 Funds response:', response);

        // Verificar si la respuesta es válida
        if (!response) {
          console.log('❌ No response received');
          setFundsError('No se recibió respuesta del servidor');
          return;
        }

        // Verificar si la respuesta es exitosa
        if (!response.success) {
          console.log('❌ Response not successful:', response);
          setFundsError('La respuesta del servidor no fue exitosa');
          return;
        }

        // Verificar si tiene la propiedad data
        if (!response.data) {
          console.log('❌ No data property in response:', response);
          setFundsError('Estructura de respuesta inválida');
          return;
        }

        // Combinar investment_funds y mutual_funds
        const allFunds = [
          ...(response.data.investment_funds || []),
          ...(response.data.mutual_funds || [])
        ];

        console.log('📊 Combined funds:', allFunds.length, 'funds');

        // Verificar si hay fondos
        if (allFunds.length === 0) {
          console.log('⚠️ No funds found in response');
          setFundsError('No hay fondos disponibles');
          return;
        }

        console.log('✅ Funds loaded successfully:', allFunds.length, 'funds');
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

  const selectedFund = funds.find((f) => f.id.toString() === fund);
  const seriesOptions = (selectedFund?.series || []).map((s) => ({
    label: s.name,
    value: s.id.toString(),
  }));

  return (
    <>
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
            <Text style={{ marginTop: 8, color: Colors.gray[500] }}>
              Cargando fondos...
            </Text>
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
              placeholder="Selecciona la serie"
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

          <View>
            <Text className='text-base font-medium'
              style={{
                color: Colors.primary[500],
                marginBottom: 8,
              }}
            >
              ¿Cuál es su nombre?
            </Text>
            <Text
              style={{
                color: Colors.gray[500],
                marginBottom: 8,
                fontSize: 14,
              }}
            >
              Dale un nombre descriptivo para reconocerlo
            </Text>
            <Input
              placeholder="Fondos Mutuos"
              value={name}
              onChangeText={(value) => onInputChange('name', value)}
              autoCapitalize="words"
            />
          </View>
        </>
      )}
    </>
  );
}
