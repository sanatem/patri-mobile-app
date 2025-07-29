import React, { useState } from 'react';
import { View, Text, ScrollView, Dimensions, Alert, ActivityIndicator, Linking } from 'react-native';
import { router } from 'expo-router';
import { LogIn } from 'lucide-react-native';
import { 
  Button, 
  Card, 
  KeyboardAwareContainer 
} from '@/components/ui';
import Colors from '@/constants/Colors';
import { PatrimoreWithIcon } from '@/components/icons';
import { useAuth } from '@/providers/AuthProvider';
import { getOnboardingStatus } from '@/utils/onboarding';

const { height } = Dimensions.get('window');

export default function LoginScreen() {
  const [localLoading, setLocalLoading] = useState(false);
  const { login, loading, error } = useAuth();

  const handleLogin = async () => {
    setLocalLoading(true);
    try {
      const success = await login();
      
      if (success) {
        const onboardingStatus = await getOnboardingStatus();
        
        if (onboardingStatus.isCompleted) {
          router.replace('/(tabs)/patrimony');
        } else {
          router.replace('/onboarding');
        }
      } else {
        Alert.alert(
          'Autenticación cancelada',
          error || 'No se pudo completar el proceso de autenticación.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Error de autenticación',
        'Ocurrió un error durante el proceso de autenticación. Por favor intenta de nuevo.',
        [{ text: 'OK' }]
      );
    } finally {
      setLocalLoading(false);
    }
  };

  const handleOpenLink = (url: string, title: string) => {
    Linking.openURL(url).catch(err => {
      Alert.alert('Error', 'No se pudo abrir el enlace');
    });
  };

  return (
    <KeyboardAwareContainer>
      <ScrollView 
        className="flex-1 bg-white" 
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >

        <View className="flex-1 pb-8 px-6" style={{ marginTop: height * 0.2 }}>
          <View className="items-center justify-center mb-2">
            <PatrimoreWithIcon width={160} height={80} color={Colors.secondary[500]} />
          </View>
          <Card style={{ padding: 20 }}>
            <View className="items-center">
              <Text 
                className="text-base font-regular text-center leading-5 px-2 mt-4 mb-4"
                style={{ color: Colors.primary[500] }}
              >
                Accede a tu cuenta para gestionar tus finanzas de manera inteligente
              </Text>
            </View>
            
            <View className="mb-4">
              <Button
                title={(loading || localLoading) ? "Conectando..." : "Ingresa"}
                onPress={handleLogin}
                disabled={loading || localLoading}
                loading={loading || localLoading}
                variant="primary"
                fullWidth={true}
                icon={!(loading || localLoading) ? <LogIn size={20} color={Colors.light.text} /> : undefined}
              />
            </View>
            
            <View className="items-center">
              <Text 
                className="text-xs font-regular text-center leading-4"
                style={{ color: Colors.primary[500] }}
              >
                Al continuar, aceptas nuestros{' '}
                <Text 
                  className="font-medium underline"
                  style={{ color: Colors.secondary[500] }}
                  onPress={() => handleOpenLink('https://patrimore.com/terminos-y-condiciones', 'Términos y Condiciones')}
                >
                  términos y condiciones
                </Text>
                {' '}y{' '}
                <Text 
                  className="font-medium underline"
                  style={{ color: Colors.secondary[500] }}
                  onPress={() => handleOpenLink('https://patrimore.com/politica-de-privacidad', 'Política de Privacidad')}
                >
                  política de privacidad
                </Text>
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAwareContainer>
  );
}