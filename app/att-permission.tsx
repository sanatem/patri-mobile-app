import React, { useState } from 'react';
import { View, Text, ScrollView, Dimensions, Platform } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowRight, CircleCheck } from 'lucide-react-native';
import { 
  Button, 
  Card, 
  KeyboardAwareContainer 
} from '@/components/ui';
import Colors from '@/constants/Colors';
import PatrimoreIcon from '@/components/icons/PatrimoreIcon';

const { height } = Dimensions.get('window');

export default function ATTPermissionScreen() {
  const [isRequesting, setIsRequesting] = useState(false);

  const handleContinue = async () => {
    setIsRequesting(true);
    
    try {
      if (Platform.OS === 'ios') {
        console.log('=== SOLICITANDO ATT ===');
        const { requestTrackingPermissionsAsync } = await import('expo-tracking-transparency');
        const { status } = await requestTrackingPermissionsAsync();
        console.log('=== ATT COMPLETADO, STATUS:', status, '===');
        
        if (status === 'granted') {
          console.log('Permisos de tracking concedidos');
        } else {
          console.log('Permisos de tracking denegados');
        }
      }
      
      await AsyncStorage.setItem('att_permission_shown', 'true');
      console.log('=== ATT MARCADO COMO VISTO ===');
      
      router.replace('/');
      
    } catch (error) {
      console.error('Error al solicitar permisos de tracking:', error);
      await AsyncStorage.setItem('att_permission_shown', 'true');
      router.replace('/');
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <KeyboardAwareContainer>
      <ScrollView 
        className="flex-1 bg-white" 
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 pb-8 px-6" style={{ marginTop: height * 0.15 }}>
          <View className="items-center justify-center mb-8">
            <PatrimoreIcon width={160} height={80} color={Colors.secondary[500]} />
          </View>   
          <Card style={{ padding: 24 }}>
            <View className="items-center mb-8">
              <Text 
                className="text-2xl font-medium text-center mb-4"
                style={{ color: Colors.primary[700] }}
              >
                Personaliza tu experiencia
              </Text>  
              <Text 
                className="text-base font-regular text-center leading-6"
                style={{ color: Colors.primary[500] }}
              >
                Para brindarte la mejor experiencia posible, Patrimore solicita permiso para personalizar el contenido y los anuncios que ves mediante recopilación de datos.
              </Text>
            </View>
            <View className="mb-6 mt-5">
              <View className="flex-row items-center mb-3 ">
                <CircleCheck size={16} color={Colors.primary[500]} style={{ marginRight: 12 }} />
                <Text className="text-sm font-regular" style={{ color: Colors.primary[600], fontSize: 14 }}>
                  Contenido relevante para ti
                </Text>
              </View>
              <View className="flex-row items-center mt-2">
                <CircleCheck size={16} color={Colors.primary[500]} style={{ marginRight: 12 }} />
                <Text className="text-sm font-regular" style={{ color: Colors.primary[600], fontSize: 14 }}>
                  Tu privacidad siempre protegida
                </Text>
              </View>
            </View>

            <View className="mb-5 mt-5">
              <Button
                title={isRequesting ? "Solicitando permisos..." : "Continuar"}
                onPress={handleContinue}
                disabled={isRequesting}
                loading={isRequesting}
                variant="primary"
                fullWidth={true}
                icon={!isRequesting ? <ArrowRight size={20} color={Colors.light.text} /> : undefined}
              />
            </View>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAwareContainer>
  );
}