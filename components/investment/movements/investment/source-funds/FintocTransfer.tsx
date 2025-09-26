import React, { useRef, useMemo, useCallback, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
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
  const webViewRef = useRef<WebView>(null);
  const shouldShowWidget = Boolean(fintocConfig?.widget_token);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fintocUrl = useMemo(() => {
    if (!fintocConfig?.widget_token) return '';

    const url = new URL('https://webview.fintoc.com/widget.html');
    url.searchParams.set('public_key', fintocConfig.public_key);
    url.searchParams.set('product', 'payments');
    url.searchParams.set('country', 'cl');
    url.searchParams.set('holder_type', 'individual');
    url.searchParams.set('widget_token', fintocConfig.widget_token);

    return url.toString();
  }, [fintocConfig]);


  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    const messageData = event.nativeEvent.data;

    if (!messageData || messageData.trim() === '') {
      onExit?.(); 
      return;
    }

    try {
      const parsedData = JSON.parse(messageData);
      const { eventName, metadata } = parsedData;

      switch (eventName) {
        case 'payment_success':
        case 'subscription_created':
        case 'link_created':
          onSuccess?.(metadata);
          break;
        case 'widget_exit':
        case 'subscription_aborted':
        case 'widget_close':
          onExit?.();
          break;
        default:
          break;
      }
    } catch (error) {
      const lowerMessage = messageData.toLowerCase();
      if (lowerMessage.includes('exit') ||
          lowerMessage.includes('close') ||
          lowerMessage.includes('cancel') ||
          lowerMessage.includes('abort')) {
        onExit?.();
      } else {
        onExit?.();
      }
    }
  }, [onSuccess, onExit]);

  if (!shouldShowWidget) {
    return (
      <View style={{ flex: 1, backgroundColor: 'white', padding: 20 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text className="text-2xl font-medium" style={{
            color: Colors.primary[700],
            marginBottom: 16,
            textAlign: 'center'
          }}>
            Error de Configuración
          </Text>

          <Text className="text-sm font-medium" style={{
            color: Colors.primary[600],
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
      <WebView
        ref={webViewRef}
        source={{ uri: fintocUrl }}
        style={{ flex: 1 }}
        onMessage={handleMessage}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            zIndex: 999
          }}>
            <ActivityIndicator size="large" color={Colors.secondary[500]} />
          </View>
        )}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        setSupportMultipleWindows={true}
        onShouldStartLoadWithRequest={(request) => {
          return request.url.includes('fintoc.com') || request.url.includes('webview');
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          onExit?.();
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView HTTP Error:', nativeEvent);
          onExit?.();
        }}
        onLoadEnd={() => {
        }}
        onNavigationStateChange={(navState) => {
          if (!navState.url.includes('fintoc.com') && navState.url !== 'about:blank') {
          }
        }}
      />
    </View>
  );
}