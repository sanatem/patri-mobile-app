import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';

export default function AuthWebViewScreen() {
  const { login } = useAuth();
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (attempted) return;
    
    const doLogin = async () => {
      setAttempted(true);
      const success = await login();
      if (success) {
        router.replace('/');
      } else {
        Alert.alert('Autenticación cancelada', 'Puedes intentar nuevamente.');
        router.replace('/');
      }
    };
    doLogin();
  }, []);

  const handleBack = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <TouchableOpacity onPress={handleBack} className="p-2">
          <ArrowLeft size={24} color={Colors.primary[500]} />
        </TouchableOpacity>
        <Text className="text-lg font-semibold" style={{ color: Colors.primary[500] }}>
          Autenticación
        </Text>
        <View style={{ width: 40 }} />
      </View>
      
      <View className="flex-1 justify-center items-center p-6">
        <ActivityIndicator size="large" color={Colors.secondary[500]} />
        <Text className="text-center text-base mt-4" style={{ color: Colors.primary[500] }}>
          Redirigiendo al proceso de autenticación...
        </Text>
      </View>
    </View>
  );
}