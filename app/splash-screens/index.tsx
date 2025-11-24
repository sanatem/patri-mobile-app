import React, { useState, useRef } from 'react';
import { View, Dimensions, ScrollView, StyleSheet, Platform, AppState, InteractionManager } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from '@/hooks/common';
import { Button, Container } from '@/components/ui';
import Colors from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

import SplashScreen1 from './splash-1';
import SplashScreen2 from './splash-2';
import SplashScreen3 from './splash-3';

export default function SplashScreens() {
  const { t } = useTranslation();
  const router = useRouter();
  const { hasSeenOnboarding } = useOnboarding();

  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const [pending, setPending] = useState(false);

  const splashScreens = [
    {
      id: 1,
      component: SplashScreen1,
      title: t('splash.1.title'),
      subtitle: t('splash.1.subtitle'),
      primaryButton: t('splash.primaryButton'),
      secondaryButton: t('splash.secondaryButton'),
    },
    {
      id: 2,
      component: SplashScreen2,
      title: t('splash.2.title'),
      subtitle: t('splash.2.subtitle'),
      primaryButton: t('splash.primaryButton'),
      secondaryButton: t('splash.secondaryButton'),
    },
    {
      id: 3,
      component: SplashScreen3,
      title: t('splash.3.title'),
      subtitle: t('splash.3.subtitle'),
      primaryButton: t('splash.primaryButton'),
      secondaryButton: t('splash.secondaryButton'),
    },
  ];

  const checkATTStatus = async () => {
    try {
      const attSeen = await AsyncStorage.getItem('att_permission_shown');
      return attSeen === 'true';
    } catch {
      return false;
    }
  };

  const requestATT = async () => {
    try {
      const { getTrackingPermissionsAsync, requestTrackingPermissionsAsync } = await import('expo-tracking-transparency');

      await new Promise<void>((resolve) => InteractionManager.runAfterInteractions(() => resolve()));

      if (AppState.currentState !== 'active') {
        await new Promise<void>((resolve) => {
          const sub = AppState.addEventListener('change', (s) => {
            if (s === 'active') {
              sub.remove();
              resolve();
            }
          });
        });
      }

      const { status, canAskAgain } = await getTrackingPermissionsAsync();
      if (Platform.OS === 'ios' && status === 'undetermined' && canAskAgain) {
        await new Promise((r) => setTimeout(r, 200));
        await requestTrackingPermissionsAsync();
      }

      await AsyncStorage.setItem('att_permission_shown', 'true');
    } catch {
      await AsyncStorage.setItem('att_permission_shown', 'true');
    }
  };

  const handleNext = async () => {
    if (pending) return;

    if (currentIndex < splashScreens.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
    } else {
      setPending(true);
      try {
        const attSeen = await checkATTStatus();

        if (!attSeen && Platform.OS === 'ios') {
          await requestATT();
        }

        await AsyncStorage.setItem('splash_seen', 'true');
        router.replace('/auth/webview');
      } finally {
        setPending(false);
      }
    }
  };

  const handleSkip = async () => {
    if (pending) return;

    setPending(true);
    try {
      const attSeen = await checkATTStatus();

      if (!attSeen && Platform.OS === 'ios') {
        await requestATT();
      }

      await AsyncStorage.setItem('splash_seen', 'true');
      router.replace('/auth/webview');
    } finally {
      setPending(false);
    }
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / width);
    setCurrentIndex(index);
  };

  return (
    <Container variant="secondaryPage">

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {splashScreens.map((screen) => {
          const SplashComponent = screen.component;
          return (
            <View key={screen.id} style={styles.slide}>
              <SplashComponent
                title={screen.title}
                subtitle={screen.subtitle}
              />
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.indicators}>
        {splashScreens.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              index === currentIndex && styles.activeIndicator,
            ]}
            className="rounded-full"
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Button
          title={splashScreens[currentIndex].primaryButton}
          onPress={handleNext}
          variant="primary"
          fullWidth
          disabled={pending}
        />

        <Button
          title={splashScreens[currentIndex].secondaryButton}
          onPress={handleSkip}
          variant="outline"
          fullWidth
          disabled={pending}
        />
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    color: Colors.gray[500],
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  indicator: {
    width: 8,
    height: 8,
    backgroundColor: Colors.gray[300],
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: Colors.secondary[500],
    width: 24,
  },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
    gap: 12,
  },
});
