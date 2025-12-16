import React, { useCallback } from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Header } from '@/components/ui/Header';
import { Container } from '@/components/ui/Container';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { useFloidSync } from '@/providers/FloidSyncProvider';
import { useTransactionMode } from '@/providers/TransactionModeProvider';

const FLOID_URL = 'https://admin.floid.app/patrimore/widget/705aefc6776c78c49dec22b8006074ff';

export default function FloidScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { startSync } = useFloidSync();
  const { markFloidSyncStarted } = useTransactionMode();

  // Handle sync completion - mark that Floid sync has started
  const handleSyncComplete = useCallback(() => {
    markFloidSyncStarted();
    startSync();
    router.replace('/(tabs)/budget/transactions');
  }, [markFloidSyncStarted, startSync, router]);

  const renderContent = () => {
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
