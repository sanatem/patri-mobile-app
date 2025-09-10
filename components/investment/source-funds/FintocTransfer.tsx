import React from 'react';
import { View } from 'react-native';
import { FintocWidgetView } from '@fintoc/fintoc-react-native';
import Colors from '@/constants/Colors';

interface FintocTransferProps {
  amount: number;
  onSuccess?: (data: any) => void;
  onExit?: () => void;
}

export function FintocTransfer({ amount, onSuccess, onExit }: FintocTransferProps) {
  // Configuración del widget de Fintoc
  const fintocOptions = {
    public_key: process.env.EXPO_PUBLIC_FINTOC_PUBLIC_KEY || 'pk_test_example',
    product: 'payment_intent',
    widget_id: process.env.EXPO_PUBLIC_FINTOC_WIDGET_ID || 'wg_test_example',
    
    amount: amount,
    currency: 'CLP',
    
    theme: {
      primary_color: Colors.primary[500],
      background_color: Colors.gray[50],
    },
    
    language: 'es',
    country: 'cl',
  };

  const handleSuccess = (data: any) => {
    console.log('Fintoc Success:', data);
    onSuccess?.(data);
  };

  const handleExit = () => {
    console.log('Fintoc Exit');
    onExit?.();
  };

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
