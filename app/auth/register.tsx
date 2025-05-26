import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';
import Button from '@/components/ui/Button';

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
      router.replace('/(patrimony)');
    } catch (err) {
      setError('Error al registrar. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <ArrowLeft size={24} color={Colors.gray[800]} />
      </TouchableOpacity>
      
      <View style={styles.header}>
        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>Completa tus datos para comenzar</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nombre completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Tu nombre"
            value={name}
            onChangeText={setName}
          />
        </View>
        
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
              placeholder="Crea una contraseña segura"
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
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirmar contraseña</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Repite tu contraseña"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              {showConfirmPassword ? (
                <EyeOff size={20} color={Colors.gray[500]} />
              ) : (
                <Eye size={20} color={Colors.gray[500]} />
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            Al registrarte, aceptas nuestros{' '}
            <Text style={styles.termsLink}>Términos y Condiciones</Text> y{' '}
            <Text style={styles.termsLink}>Política de Privacidad</Text>
          </Text>
        </View>
        
        <Button 
          onPress={handleRegister} 
          loading={loading}
          label="Crear cuenta"
        />
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>¿Ya tienes una cuenta?</Text>
        <TouchableOpacity onPress={() => router.push('/auth/login')}>
          <Text style={styles.loginLink}>Inicia sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    padding: 24,
  },
  backButton: {
    marginTop: 40,
    marginBottom: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: Colors.gray[800],
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.gray[600],
  },
  form: {
    marginBottom: 24,
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
  termsContainer: {
    marginVertical: 24,
  },
  termsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.gray[600],
    lineHeight: 20,
  },
  termsLink: {
    fontFamily: 'Inter-Medium',
    color: Colors.primary[500],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  footerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.gray[600],
  },
  loginLink: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.primary[500],
    marginLeft: 4,
  },
});