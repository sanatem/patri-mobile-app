import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { KeyboardAwareContainer } from '@/components/ui/KeyboardAwareContainer';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await register(name, email, password);
      router.replace('/patrimony');
    } catch (err) {
      setError('Error al registrar. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareContainer>
      <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 24 }}>
        <TouchableOpacity onPress={() => router.back()} className="mt-10 mb-5">
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>

        <View className="mb-8">
          <Text className="text-2xl text-gray-800 font-bold mb-2">Crear cuenta</Text>
          <Text className="text-gray-600 font-regular">Completa tus datos para comenzar</Text>
        </View>

        {error && (
          <View className="bg-red-50 border border-red-200 p-3 rounded-lg mb-4">
            <Text className="text-red-500 font-medium text-sm">{error}</Text>
          </View>
        )}

        <View className="mb-6">
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Nombre completo</Text>
            <TextInput
              className="h-12 border border-gray-300 rounded-lg px-4 text-base text-gray-800 font-regular"
              placeholder="Tu nombre"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Correo electrónico</Text>
            <TextInput
              className="h-12 border border-gray-300 rounded-lg px-4 text-base text-gray-800 font-regular"
              placeholder="tucorreo@ejemplo.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Contraseña</Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg h-12">
              <TextInput
                className="flex-1 px-4 text-base text-gray-800 font-regular"
                placeholder="Crea una contraseña segura"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-3">
                {showPassword ? (
                  <EyeOff size={20} color="#9CA3AF" />
                ) : (
                  <Eye size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Confirmar contraseña</Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg h-12">
              <TextInput
                className="flex-1 px-4 text-base text-gray-800 font-regular"
                placeholder="Repite tu contraseña"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="p-3">
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#9CA3AF" />
                ) : (
                  <Eye size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View className="my-6">
            <Text className="text-sm font-regular text-gray-600 leading-5">
              Al registrarte, aceptas nuestros{' '}
              <Text className="text-primary-500 font-medium">Términos y Condiciones</Text> y{' '}
              <Text className="text-primary-500 font-medium">Política de Privacidad</Text>
            </Text>
          </View>

          <Button onPress={handleRegister} loading={loading} title="Crear cuenta" />
        </View>

        <View className="flex-row justify-center mb-6">
          <Text className="text-base text-gray-600 font-regular">¿Ya tienes una cuenta?</Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text className="text-base text-primary-500 font-semibold ml-1">Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAwareContainer>
  );
}
