import React, { useState, useRef } from 'react';
import { View, Dimensions, ScrollView, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from '@/hooks/common';
import { Button, Container } from '@/components/ui';
import Colors from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

import SplashScreen1 from './splash-1';
import SplashScreen2 from './splash-2';
import SplashScreen3 from './splash-3';

const splashScreens = [
  {
    id: 1,
    component: SplashScreen1,
    title: 'Tus datos, blindados.',
    subtitle: 'Protegemos tu información con seguridad de nivel bancario. Sin publicidad, sin compartir tus datos.',
    primaryButton: 'Comenzar',
    secondaryButton: 'Iniciar sesión',
  },
  {
    id: 2,
    component: SplashScreen2,
    title: 'Convierte tus sueños en un plan.',
    subtitle: 'Diseña tu estrategia financiera y descubre cómo tus decisiones impactan tu patrimonio con el tiempo.',
    primaryButton: 'Comenzar',
    secondaryButton: 'Iniciar sesión',
  },
  {
    id: 3,
    component: SplashScreen3,
    title: 'Todo tu patrimonio, en un solo lugar.',
    subtitle: 'Integra tus cuentas y fondos para ver cómo crece tu patrimonio en el tiempo desde un dashboard claro y completo.',
    primaryButton: 'Comenzar',
    secondaryButton: 'Iniciar sesión',
  },
];

export default function SplashScreens() {
  const router = useRouter();
  const { hasSeenOnboarding } = useOnboarding();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const [isRequestingATT, setIsRequestingATT] = useState(false);
  


  const checkATTStatus = async () => {
    try {
      const attSeen = await AsyncStorage.getItem('att_permission_shown');
      return attSeen === 'true';
    } catch (error) {
      return false;
    }
  };

  const requestATT = async () => {
    setIsRequestingATT(true);
    try {
      const { requestTrackingPermissionsAsync } = await import('expo-tracking-transparency');
      const { status } = await requestTrackingPermissionsAsync();
      

      
      await AsyncStorage.setItem('att_permission_shown', 'true');
    } catch (error) {
      await AsyncStorage.setItem('att_permission_shown', 'true');
    } finally {
      setIsRequestingATT(false);
      await AsyncStorage.setItem('splash_seen', 'true');
      router.replace('/auth/login');
    }
  };

  const handleNext = async () => {
    if (currentIndex < splashScreens.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
    } else {
      const attSeen = await checkATTStatus();
      
      if (!attSeen && Platform.OS === 'ios') {
        await requestATT();
      } else {
        await AsyncStorage.setItem('splash_seen', 'true');
        router.replace('/auth/login');
      }
    }
  };

  const handleSkip = async () => {
    const attSeen = await checkATTStatus();
    
    if (!attSeen && Platform.OS === 'ios') {
      await requestATT();
    } else {
      await AsyncStorage.setItem('splash_seen', 'true');
      router.replace('/auth/login');
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
        {splashScreens.map((screen, index) => {
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
         />
         
         <Button
           title={splashScreens[currentIndex].secondaryButton}
           onPress={handleSkip}
           variant="outline"
           fullWidth
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