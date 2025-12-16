import React, { useCallback, useRef, useState } from 'react';
import { View, TouchableOpacity, Platform, ActivityIndicator, Text } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Header } from '@/components/ui/Header';
import { Container } from '@/components/ui/Container';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { useFloidSync } from '@/providers/FloidSyncProvider';
import { useTransactionMode } from '@/providers/TransactionModeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { deactivateAllBudgetTemplates } from '@/services/budget/budget-templates';

const FLOID_URL = 'https://admin.floid.app/patrimore/widget/705aefc6776c78c49dec22b8006074ff';

export default function FloidScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { startSync } = useFloidSync();
  const { markFloidSyncStarted } = useTransactionMode();
  const { accessToken } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const isProcessingRef = useRef(false);

  // Handle sync completion - mark that Floid sync has started
  const handleSyncComplete = useCallback(async () => {
    // Prevent multiple calls
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsProcessing(true);

    try {
      // Deactivate all existing budget templates before switching to Floid
      // This ensures manual transaction budgets don't interfere with Floid data
      if (accessToken) {
        try {
          const result = await deactivateAllBudgetTemplates(accessToken);
          if (result.deactivatedCount > 0) {
            console.log(`Deactivated ${result.deactivatedCount} budget templates before Floid sync`);
          }
        } catch (error) {
          console.error('Error deactivating budget templates:', error);
          // Continue with sync even if deactivation fails
        }
      }

      await markFloidSyncStarted();
      startSync();
      router.replace('/(tabs)/budget/transactions');
    } catch (error) {
      console.error('Error completing Floid sync:', error);
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  }, [markFloidSyncStarted, startSync, router, accessToken]);

  const renderContent = () => {
    // Show loading indicator while processing
    if (isProcessing) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <Text style={{ marginTop: 16, color: Colors.primary[500], textAlign: 'center' }}>
            {t('budget.processing_sync', 'Procesando sincronización...')}
          </Text>
        </View>
      );
    }

    if (Platform.OS === 'web') {
      return (
        <iframe
          src={FLOID_URL}
          style={{
            flex: 1,
            border: 'none',
            width: '100%',
            height: '100%'
          }}
          allow="camera; microphone; geolocation"
        />
      );
    } else {
      const { WebView } = require('react-native-webview');
      return (
        <WebView
          source={{ uri: FLOID_URL }}
          style={{ flex: 1 }}
          startInLoadingState={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          mixedContentMode="compatibility"
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          onNavigationStateChange={(navState: { url: string }) => {
             if (navState.url && navState.url.includes('patrimore.com')) {
               handleSyncComplete();
             }
           }}
           onShouldStartLoadWithRequest={(request: { url: string }) => {
             if (request.url.includes('patrimore.com')) {
               handleSyncComplete();
               return false;
             }
             return true;
           }}
        />
      );
    }
  };

  return (
    <Container variant="secondaryPage">
      <Header
        title={t('budget.integrate_data')}
        leftAction={
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full justify-center items-center"
          >
            <ChevronLeft size={24} color={Colors.primary[500]} />
          </TouchableOpacity>
        }
      />

             {renderContent()}
    </Container>
  );
}
