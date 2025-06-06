import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { useAuth } from '@/providers/AuthProvider';
import { router } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, Shield, Star } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { GoogleIcon } from '@/components/icons/GoogleIcon';
import { AppleIcon } from '@/components/icons/AppleIcon';
import { Button } from '@/components/ui/Button';

const { height } = Dimensions.get('window');

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { login, loginWithGoogle, loginWithApple } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit: SubmitHandler<LoginFormData> = async ({ email, password }) => {
    setSubmitError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)/patrimony');
    } catch {
      setSubmitError('Credenciales incorrectas.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setLoading(true);
    try {
      provider === 'google' ? await loginWithGoogle() : await loginWithApple();
      router.replace('/(tabs)/patrimony');
    } catch {
      setSubmitError(`Error al acceder con ${provider}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="absolute top-0 left-0 w-full rounded-b-[40px] bg-primary-500" style={{ height: height * 0.45 }} />
      <View className="pt-12 px-6 pb-16 items-center">
        <Text className="text-white text-4xl font-bold">Patrimore</Text>
        <View className="flex-row mt-2">
          <View className="flex-row items-center bg-white/15 px-3 py-1.5 rounded-full mx-1 border border-white/20">
            <Star size={14} color="#FF6503" fill="#FF6503" />
            <Text className="text-xs text-white font-semibold ml-1">+50k usuarios</Text>
          </View>
          <View className="flex-row items-center bg-white/15 px-3 py-1.5 rounded-full mx-1 border border-white/20">
            <Shield size={14} color="#FF6503" />
            <Text className="text-xs text-white font-semibold ml-1">100% seguro</Text>
          </View>
        </View>
      </View>
      <View className="bg-white mx-6 -mt-10 rounded-3xl p-7 border-2 border-gray-200">
        <Text className="text-2xl font-bold text-gray-800 text-center mb-2">Bienvenido</Text>
        <Text className="text-sm text-gray-600 text-center mb-6 font-regular">Accede a tu cuenta para continuar</Text>
        {submitError && (
          <Text className="bg-red-50 border border-red-200 text-red-600 rounded p-3 mb-4 text-sm text-center">
            {submitError}
          </Text>
        )}
        <Controller
          control={control}
          name="email"
          rules={{
            required: 'El correo es requerido *',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Correo no válido',
            },
          }}
          render={({ field: { onChange, value, onBlur } }) => (
            <Input
              style={{ backgroundColor: 'transparent', borderWidth: 0 }}
              label="Correo electrónico"
              placeholder="tucorreo@ejemplo.com"
              icon={<Mail size={20} color="#9CA3AF" />}
              value={value}
              onChangeText={onChange}
              keyboardType="email-address"
              error={errors.email?.message}
              underlineColorAndroid="transparent"

            />
          )}
        />
        <Controller
          control={control}
          name="password"
          rules={{
            required: 'La contraseña es requerida *',
            minLength: {
              value: 6,
              message: 'Debe tener al menos 6 caracteres',
            },
          }}
          render={({ field: { onChange, value, onBlur } }) => (
            <Input
              style={{ backgroundColor: 'transparent', borderWidth: 0 }}
              label="Contraseña"
              placeholder="Ingresa tu contraseña"
              icon={<Lock size={20} color="#9CA3AF" />}
              rightIcon={showPassword ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
              onRightIconPress={() => setShowPassword(!showPassword)}
              value={value}
              onChangeText={onChange}
              secureTextEntry={!showPassword}
              error={errors.password?.message}
              underlineColorAndroid="transparent"

            />
          )}
        />
        <TouchableOpacity className="self-center mb-2 mt-1">
          <Text className="text-sm font-semibold text-primary-500">¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
        <Button
          title={loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          fullWidth
        />
        <View className="flex-row items-center my-5">
          <View className="flex-1 h-px bg-gray-200" />
          <Text className="text-gray-500 text-sm mx-3 font-regular">o continúa con</Text>
          <View className="flex-1 h-px bg-gray-200" />
        </View>
        <View className="flex-row justify-between">
          <TouchableOpacity
            onPress={() => handleSocialLogin('google')}
            className="flex-1 h-12 border-2 border-gray-200 rounded-xl justify-center items-center mx-1 bg-white"
          >
            <View className="flex-row items-center">
              <GoogleIcon />
              <Text className="text-gray-700 ml-2 font-semibold">Google</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleSocialLogin('apple')}
            className="flex-1 h-12 border-2 border-gray-200 rounded-xl justify-center items-center mx-1 bg-white"
          >
            <View className="flex-row items-center">
              <AppleIcon />
              <Text className="text-gray-700 ml-2 font-semibold">Apple</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity className="self-center mt-5" onPress={() => router.push('/auth/register')}>
          <Text className="text-sm font-semibold text-primary-600 underline">Regístrate gratis</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
