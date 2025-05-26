import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Eye, EyeOff, ChevronRight, Mail, Lock, Shield, Star } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';
import Button from '@/components/ui/Button';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  const { login, loginAsGuest, loginWithGoogle, loginWithApple } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await login(email, password);
      router.replace('/(patrimony)');
    } catch (err) {
      setError('Credenciales incorrectas. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      await loginAsGuest();
      router.replace('/(patrimony)');
    } catch (err) {
      setError('Error al acceder como invitado');
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
      router.replace('/(patrimony)');
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
          <View style={styles.logoIcon}>
            <Shield size={32} color="white" strokeWidth={2.5} />
          </View>
          <Text style={styles.logo}>Patrimore</Text>
          <Text style={styles.subtitle}>Tu copiloto financiero personal</Text>
          
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
          <Text style={styles.title}>Bienvenido de nuevo</Text>
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
              <Text style={styles.socialButtonText}>Google</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => handleSocialLogin('apple')}
          >
            <View style={styles.socialButtonContent}>
              <Text style={styles.socialButtonText}>Apple</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Guest login */}
        <TouchableOpacity 
          style={styles.guestButton}
          onPress={handleGuestLogin}
        >
          <Text style={styles.guestButtonText}>Explorar como invitado</Text>
          <ChevronRight size={18} color={Colors.gray[500]} />
        </TouchableOpacity>
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>¿No tienes una cuenta?</Text>
        <TouchableOpacity onPress={() => router.push('/auth/register')}>
          <Text style={styles.registerLink}>Regístrate gratis</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 16,
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
    alignSelf: 'flex-end',
    marginBottom: 28,
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
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  socialButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: Colors.gray[700],
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  guestButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: Colors.gray[600],
    marginRight: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    marginTop: 20,
  },
  footerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: Colors.gray[600],
  },
  registerLink: {
    fontFamily: 'Inter-Bold',
    fontSize: 15,
    color: Colors.primary[500],
    marginLeft: 6,
  },
});