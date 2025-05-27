import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Eye, EyeOff, ChevronRight, Mail, Lock, Shield, Star } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import Colors from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';
import Button from '@/components/ui/Button';

const { width, height } = Dimensions.get('window');

// Google Icon Component
const GoogleIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <Path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <Path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <Path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </Svg>
);

// Apple Icon Component
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  const { login, loginWithGoogle, loginWithApple } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await login(email, password);
      router.replace('/(tabs)/patrimony');
    } catch (err) {
      setError('Credenciales incorrectas. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };



  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setLoading(true);
    try {
      if (provider === 'google') {
        await loginWithGoogle();
      } else {
        await loginWithApple();
      }
      router.replace('/(tabs)/patrimony');
    } catch (err) {
      setError(`Error al acceder con ${provider === 'google' ? 'Google' : 'Apple'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Background gradient effect */}
      <View style={styles.backgroundGradient} />
      
      {/* Hero section */}
      <View style={styles.heroSection}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>Patrimore</Text>
          
          {/* Trust indicators */}
          <View style={styles.trustIndicators}>
            <View style={styles.trustBadge}>
              <Star size={14} color={Colors.primary[600]} fill={Colors.primary[600]} />
              <Text style={styles.trustText}>+50k usuarios</Text>
            </View>
            <View style={styles.trustBadge}>
              <Shield size={14} color={Colors.primary[600]} />
              <Text style={styles.trustText}>100% seguro</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Login form card */}
      <View style={styles.formCard}>
        <View style={styles.formHeader}>
          <Text style={styles.title}>Bienvenido</Text>
          <Text style={styles.description}>Accede a tu cuenta para continuar</Text>
        </View>
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {/* Email input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Correo electrónico</Text>
          <View style={[
            styles.inputWrapper,
            emailFocused && styles.inputWrapperFocused
          ]}>
            <Mail size={20} color={emailFocused ? Colors.primary[500] : Colors.gray[400]} />
            <TextInput
              style={styles.input}
              placeholder="tucorreo@ejemplo.com"
              placeholderTextColor={Colors.gray[400]}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </View>
        </View>
        
        {/* Password input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Contraseña</Text>
          <View style={[
            styles.inputWrapper,
            passwordFocused && styles.inputWrapperFocused
          ]}>
            <Lock size={20} color={passwordFocused ? Colors.primary[500] : Colors.gray[400]} />
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu contraseña"
              placeholderTextColor={Colors.gray[400]}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              {showPassword ? (
                <EyeOff size={20} color={Colors.gray[500]} />
              ) : (
                <Eye size={20} color={Colors.gray[500]} />
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.registerLink}
          onPress={() => router.push('/auth/register')}
        >
          <Text style={styles.registerLinkText}>Regístrate gratis</Text>
        </TouchableOpacity>
        
        
        {/* Login button with gradient */}
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          <View style={styles.loginButtonGradient}>
            <Text style={styles.loginButtonText}>
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Text>
          </View>
        </TouchableOpacity>
        
        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>o continúa con</Text>
          <View style={styles.line} />
        </View>
        
        {/* Social login buttons */}
        <View style={styles.socialButtons}>
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => handleSocialLogin('google')}
          >
            <View style={styles.socialButtonContent}>
              <GoogleIcon size={20} />
              <Text style={styles.socialButtonText}>Google</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => handleSocialLogin('apple')}
          >
            <View style={styles.socialButtonContent}>
              <AppleIcon size={20} />
              <Text style={styles.socialButtonText}>Apple</Text>
            </View>
          </TouchableOpacity>
        </View>
        

      </View>
      
      {/* Footer */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height * 0.45,
    backgroundColor: Colors.primary[500],
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: Colors.primary[500],
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 20,
  },
  heroSection: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    paddingBottom: 60,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logo: {
    fontFamily: 'Inter-Bold',
    fontSize: 36,
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: {
      width: 0,
      height: 2,
    },
    textShadowRadius: 4,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  trustIndicators: {
    flexDirection: 'row',
    marginTop: 8,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  trustText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: 'white',
    marginLeft: 6,
  },
  formCard: {
    backgroundColor: 'white',
    marginHorizontal: 24,
    marginTop: -30,
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.1)',
  },
  formHeader: {
    marginBottom: 28,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: Colors.gray[800],
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.gray[600],
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    color: '#ef4444',
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    marginBottom: 8,
    color: Colors.gray[700],
  },
  inputWrapper: {
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: Colors.gray[200],
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: Colors.gray[50],
  },
  inputWrapperFocused: {
    borderColor: Colors.primary[500],
    backgroundColor: 'white',
    shadowColor: Colors.primary[500],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.gray[800],
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  forgotPasswordText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: Colors.primary[500],
  },
  loginButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: Colors.primary[500],
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  loginButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderRadius: 16,
  },
  loginButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 17,
    color: 'white',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gray[200],
  },
  dividerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.gray[500],
    marginHorizontal: 12,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
    height: 52,
    borderWidth: 2,
    borderColor: Colors.gray[200],
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  socialButtonContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  socialButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: Colors.gray[700],
    marginLeft: 8,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 32,
  },
  footerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: Colors.gray[600],
  },
  registerLink: {
    alignSelf: 'center',
    marginBottom: 28,
    marginTop: 4,
  },
  registerLinkText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: Colors.primary[600],
    textDecorationLine: 'underline',
  },
});