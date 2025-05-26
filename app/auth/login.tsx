import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Eye, EyeOff, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';
import Button from '@/components/ui/Button';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Patrimore</Text>
        <Text style={styles.subtitle}>Tu copiloto financiero personal</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.title}>Iniciar Sesión</Text>
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="tucorreo@ejemplo.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Contraseña"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
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
        
        <Button 
          onPress={handleLogin} 
          loading={loading}
          label="Iniciar Sesión"
        />
        
        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>o continúa con</Text>
          <View style={styles.line} />
        </View>
        
        <View style={styles.socialButtons}>
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => handleSocialLogin('google')}
          >
            <Text style={styles.socialButtonText}>Google</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => handleSocialLogin('apple')}
          >
            <Text style={styles.socialButtonText}>Apple</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.guestButton}
          onPress={handleGuestLogin}
        >
          <Text style={styles.guestButtonText}>Saltar Inicio de Sesión</Text>
          <ChevronRight size={16} color={Colors.gray[500]} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>¿No tienes una cuenta?</Text>
        <TouchableOpacity onPress={() => router.push('/auth/register')}>
          <Text style={styles.registerLink}>Regístrate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 24,
  },
  header: {
    marginTop: 40,
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: Colors.primary[500],
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.gray[600],
  },
  form: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 24,
    color: Colors.gray[800],
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
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 8,
    color: Colors.gray[700],
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.gray[800],
  },
  passwordContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: 8,
    height: 50,
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.gray[800],
  },
  eyeIcon: {
    padding: 12,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.primary[500],
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
    height: 50,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  socialButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.gray[800],
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  guestButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.gray[500],
    marginRight: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  footerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.gray[600],
  },
  registerLink: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.primary[500],
    marginLeft: 4,
  },
});