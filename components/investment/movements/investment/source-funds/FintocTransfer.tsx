import React from 'react';
import { View, Text } from 'react-native';
import { FintocWidgetView } from '@fintoc/fintoc-react-native';
import Colors from '@/constants/Colors';

interface FintocTransferProps {
  amount: number;
  onSuccess?: (data: any) => void;
  onExit?: () => void;
  fintocConfig?: {
    widget_token: string;
    public_key: string;
    webhook_url: string;
  };
}

export function FintocTransfer({ amount, onSuccess, onExit, fintocConfig }: FintocTransferProps) {

  const shouldShowWidget = Boolean(fintocConfig?.widget_token);

  const fintocOptions = {
    public_key: fintocConfig?.public_key || process.env.EXPO_PUBLIC_FINTOC_PUBLIC_KEY || 'pk_test_mUqyEi4cVChLF748ySsm-b6M38w_LkS2',
    product: 'payments',
    country: 'cl',
    widget_token: fintocConfig?.widget_token,
  };

  const handleSuccess = (data: any) => {

    onSuccess?.(data);
  };

  const handleExit = () => {
    console.log('Fintoc Exit');
    onExit?.();
  };

  if (!shouldShowWidget) {
    return (
      <View style={{ flex: 1, backgroundColor: 'white', padding: 20 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ 
            fontSize: 24, 
            fontWeight: 'bold', 
            color: Colors.error[700],
            marginBottom: 16,
            textAlign: 'center'
          }}>
            Error de Configuración
          </Text>
          
          <Text style={{ 
            fontSize: 16, 
            color: Colors.error[600],
            textAlign: 'center',
            lineHeight: 24
          }}>
            No se recibió la configuración de Fintoc del servidor. 
            Por favor, intenta nuevamente o contacta soporte.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <FintocWidgetView
        options={fintocOptions}
        onSuccess={handleSuccess}
        onExit={handleExit}
        style={{ flex: 1 }}
      />
    </View>
  );
}