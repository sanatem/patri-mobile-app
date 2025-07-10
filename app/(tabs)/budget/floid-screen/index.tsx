import React from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Header } from '@/components/ui/Header';
import { Container } from '@/components/ui/Container';
import Colors from '@/constants/Colors';

const FLOID_URL = 'https://admin.floid.app/patrimore/widget/705aefc6776c78c49dec22b8006074ff';

export default function FloidScreen() {
  const router = useRouter();

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
        />
      );
    }
  };

  return (
    <Container variant="secondaryPage">
      <Header 
        title="Integrar datos bancarios"
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