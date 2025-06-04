import React, { useState } from 'react';
import { Text, TextInput, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, Shield, Star } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '@/providers/AuthProvider';

const { height } = Dimensions.get('window');

const GoogleIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <Path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <Path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <Path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </Svg>
);

const AppleIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill="#000000"
      d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
    />
  </Svg>
);

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const { login, loginWithGoogle, loginWithApple } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) return setError('Por favor completa todos los campos');
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)/patrimony');
    } catch (err) {
      setError('Credenciales incorrectas.');
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
      setError(`Error al acceder con ${provider}`);
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

      <View className="bg-white mx-6 -mt-10 rounded-3xl p-7 border border-orange-100 shadow-md">
        <Text className="text-2xl font-bold text-gray-800 text-center mb-2">Bienvenido</Text>
        <Text className="text-sm text-gray-600 text-center mb-6 font-regular">Accede a tu cuenta para continuar</Text>

        {error && <Text className="bg-red-50 border border-red-200 text-red-600 rounded p-3 mb-4 text-sm">{error}</Text>}

        <View className="mb-5">
          <Text className="font-semibold text-base mb-2 text-gray-700">Correo electrónico</Text>
          <View className={`flex-row items-center h-14 px-4 rounded-xl border-2 ${emailFocused ? 'bg-white border-primary-500 shadow-md' : 'bg-gray-50 border-gray-200'}`}>
            <Mail size={20} color={emailFocused ? '#FF6503' : '#9CA3AF'} />
            <TextInput
              className="flex-1 px-3 text-base text-gray-800 font-regular"
              placeholder="tucorreo@ejemplo.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </View>
        </View>

        <View className="mb-5">
          <Text className="font-semibold text-base mb-2 text-gray-700">Contraseña</Text>
          <View className={`flex-row items-center h-14 px-4 rounded-xl border-2 ${passwordFocused ? 'bg-white border-primary-500 shadow-md' : 'bg-gray-50 border-gray-200'}`}>
            <Lock size={20} color={passwordFocused ? '#FF6503' : '#9CA3AF'} />
            <TextInput
              className="flex-1 px-3 text-base text-gray-800 font-regular"
              placeholder="Ingresa tu contraseña"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
            <TouchableOpacity className="p-2" onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={20} color="#6B7280" /> : <Eye size={20} color="#6B7280" />}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity className="self-center mb-2 mt-1">
          <Text className="text-sm font-semibold text-primary-500">¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogin} disabled={loading} className="h-14 rounded-2xl bg-primary-500 justify-center items-center shadow-md mb-7">
          <Text className="text-white text-base font-semibold">
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Text>
        </TouchableOpacity>

        <View className="flex-row items-center my-5">
          <View className="flex-1 h-px bg-gray-200" />
          <Text className="text-gray-500 text-sm mx-3 font-regular">o continúa con</Text>
          <View className="flex-1 h-px bg-gray-200" />
        </View>

        <View className="flex-row justify-between">
          <TouchableOpacity onPress={() => handleSocialLogin('google')} className="flex-1 h-12 border-2 border-gray-200 rounded-xl justify-center items-center mx-1 bg-white shadow-sm">
            <View className="flex-row items-center">
              <GoogleIcon />
                <Text className="text-gray-700 ml-2 font-semibold">Google</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleSocialLogin('apple')} className="flex-1 h-12 border-2 border-gray-200 rounded-xl justify-center items-center mx-1 bg-white shadow-sm">
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
