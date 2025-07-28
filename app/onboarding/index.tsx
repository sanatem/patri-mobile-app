import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from '@/hooks/common';
import { useOnboarding as useOnboardingService } from '@/hooks/user';
import { useKeyboardHandler } from '@/hooks/common';
import { PatrimoreIcon } from '@/components/icons';
import { Button, Container, Input, Card, Select, CalendarSelect, KeyboardAwareContainer } from '@/components/ui';
import Colors from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height } = Dimensions.get('window');

const MONTHLY_INCOME_OPTIONS = [
  { value: 'less_than_1_millon', label: 'Menos de $1.000.000' },
  { value: 'between_1_and_5_millons', label: 'Entre $1.000.001 a $5.000.000' },
  { value: 'between_5_and_10_millons', label: 'Entre $5.000.001 a $10.000.000' },
  { value: 'between_10_and_25_millons', label: 'Entre $10.000.001 a $25.000.000' },
  { value: 'greater_than_25_millons', label: 'Mayor de $25.000.001' },
];

const COUNTRY_OPTIONS = [
  { label: 'Chile', value: 'Chile' },
  { label: 'Argentina', value: 'Argentina' },
  { label: 'Brasil', value: 'Brasil' },
  { label: 'Colombia', value: 'Colombia' },
  { label: 'México', value: 'México' },
  { label: 'Perú', value: 'Perú' },
  { label: 'Uruguay', value: 'Uruguay' },
  { label: 'Estados Unidos', value: 'Estados Unidos' },
  { label: 'España', value: 'España' },
  { label: 'Otro', value: 'Otro' }
];



export default function OnboardingScreen() {
  const router = useRouter();
  const { markAsSeen } = useOnboarding();
  const { submitOnboardingData, loading: serviceLoading, error: serviceError } = useOnboardingService();
  const { keyboardHeight, isKeyboardVisible } = useKeyboardHandler();
  

  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    rut: '',
    residence_country: '',
    birth_date: '',
    monthly_income: '',
  });
  const [loading, setLoading] = useState(false);
  const isLoading = loading || serviceLoading;
  const [errors, setErrors] = useState<string[]>([]);
  const allErrors = [...errors, ...(serviceError ? [serviceError] : [])];

  useEffect(() => {
    validateStep(currentStep);
  }, [currentStep]);

  // Limpiar errores del servicio cuando cambie el paso
  useEffect(() => {
    if (serviceError) {
      // Los errores del servicio se manejan en el hook
    }
  }, [serviceError]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Validar después de un pequeño delay para evitar validaciones excesivas
    setTimeout(() => {
      validateStep(currentStep);
    }, 100);
  };

  const formatRUT = (value: string) => {
    // Remover todos los caracteres no válidos excepto números y k/K
    let rut = value.replace(/[^0-9kK]/g, '');
    
    // Limitar a 9 caracteres máximo
    if (rut.length > 9) {
      rut = rut.slice(0, 9);
    }
    
    // Si hay al menos 2 caracteres, agregar puntos y guión
    if (rut.length >= 2) {
      const body = rut.slice(0, -1);
      const digit = rut.slice(-1);
      
      // Agregar puntos cada 3 dígitos desde la derecha
      let formattedBody = '';
      for (let i = body.length - 1, j = 0; i >= 0; i--, j++) {
        if (j > 0 && j % 3 === 0) {
          formattedBody = '.' + formattedBody;
        }
        formattedBody = body[i] + formattedBody;
      }
      
      rut = formattedBody + '-' + digit;
    }
    
    return rut.toUpperCase();
  };

  const convertDateFormat = (dateString: string): string => {
    if (!dateString || !dateString.includes('/')) {
      return dateString;
    }
    
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const day = parts[0];
      const month = parts[1];
      const year = parts[2];
      return `${year}/${month}/${day}`;
    }
    
    return dateString;
  };



  const validateStep = (step: number) => {
    const newErrors = [];
    
    if (step === 1) {
      if (!formData.first_name.trim()) {
        newErrors.push('El nombre es requerido');
      }
      
      if (!formData.last_name.trim()) {
        newErrors.push('El apellido es requerido');
      }
      
      if (!formData.rut.trim()) {
        newErrors.push('El RUT es requerido');
      } else if (formData.rut.length < 3) {
        newErrors.push('El RUT debe tener al menos 3 caracteres');
      }
    } else if (step === 2) {
      if (!formData.residence_country.trim()) {
        newErrors.push('El país de residencia es requerido');
      }
      
      if (!formData.birth_date.trim()) {
        newErrors.push('La fecha de nacimiento es requerida');
      }
      
      if (!formData.monthly_income.trim()) {
        newErrors.push('Los ingresos mensuales son requeridos');
      }
    }
    
    setErrors(newErrors);
    return newErrors;
  };

  const validateForm = () => {
    const newErrors = [];
    
    if (!formData.first_name.trim()) {
      newErrors.push('El nombre es requerido');
    }
    
    if (!formData.last_name.trim()) {
      newErrors.push('El apellido es requerido');
    }
    
    if (!formData.rut.trim()) {
      newErrors.push('El RUT es requerido');
    } else if (formData.rut.length < 3) {
      newErrors.push('El RUT debe tener al menos 3 caracteres');
    }
    
    if (!formData.residence_country.trim()) {
      newErrors.push('El país de residencia es requerido');
    }
    
    if (!formData.birth_date.trim()) {
      newErrors.push('La fecha de nacimiento es requerida');
    }
    
    if (!formData.monthly_income.trim()) {
      newErrors.push('Los ingresos mensuales son requeridos');
    }
    
    setErrors(newErrors);
    return newErrors;
  };

  const handleNextStep = () => {
    const stepErrors = validateStep(currentStep);
    
    if (stepErrors.length > 0) {
      return;
    }
    
    if (currentStep === 1) {
      setCurrentStep(2);
    } else {
      handleComplete();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    const formErrors = validateForm();
    if (formErrors.length > 0) {
      return;
    }

    setLoading(true);
    
    try {
      const onboardingData = {
        personal_information: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          rut: formData.rut,
          birth_date: convertDateFormat(formData.birth_date),
          monthly_incomes: formData.monthly_income,
          residence_country: formData.residence_country,
        }
      };

      // Validar que todos los campos requeridos estén presentes
      const requiredFields = ['first_name', 'last_name', 'rut', 'birth_date', 'monthly_income', 'residence_country'];
      const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
      
      if (missingFields.length > 0) {
        console.error('❌ Missing required fields:', missingFields);
        throw new Error(`Campos faltantes: ${missingFields.join(', ')}`);
      }

      console.log('🚀 Submitting onboarding data:', onboardingData);

      const response = await submitOnboardingData(onboardingData);
      
      if (response) {
        console.log('✅ Onboarding completed successfully');
        await markAsSeen();
        await AsyncStorage.setItem('onboarding_completed', 'true');
        router.replace('/(tabs)/patrimony');
      } else {
        console.log('❌ Onboarding failed - no response received');
        // El error ya está manejado por el hook useOnboardingService
      }
    } catch (error) {
      console.error('❌ Error in handleComplete:', error);
      // El error ya está manejado por el hook useOnboardingService
    } finally {
      setLoading(false);
    }
  };



  return (
    <KeyboardAwareContainer>
      <Container variant="secondaryPage">
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ 
            flexGrow: 1,
            paddingBottom: isKeyboardVisible ? keyboardHeight + 20 : 0
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: height * 0.1 }}>
            <View style={{ alignItems: 'center', marginBottom: 10 }}>
              <PatrimoreIcon width={160} height={80} color={Colors.secondary[500]} />
            </View>

            <Card style={{ padding: 24 }}>
              <View style={{ marginBottom: 24 }}>
                <Text className='font-medium text-2xl'
                  style={{
                    color: Colors.primary[700],
                    textAlign: 'center',
                    marginBottom: 8,
                  }}
                >
                  {currentStep === 1 ? 'Información Personal' : 'Información Adicional'}
                </Text>
                <Text className='text-base font-regular text-center'
                  style={{
                    color: Colors.primary[500],
                    textAlign: 'center',
                  }}
                >
                  {currentStep === 1 
                    ? 'Cuéntanos sobre ti' 
                    : 'Completa tu perfil para personalizar tu experiencia'
                  }
                </Text>
                
                {/* Indicador de progreso */}
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'center', 
                  marginTop: 16,
                  gap: 8
                }}>
                  <View style={{
                    width: 20,
                    height: 4,
                    backgroundColor: currentStep >= 1 ? Colors.secondary[500] : Colors.gray[300],
                    borderRadius: 2,
                  }} />
                  <View style={{
                    width: 20,
                    height: 4,
                    backgroundColor: currentStep >= 2 ? Colors.secondary[500] : Colors.gray[300],
                    borderRadius: 2,
                  }} />
                </View>
              </View>

               <View style={{ gap: 20 }}>
                 {currentStep === 1 ? (
                   <>
                     <View>
                       <Text className='text-base font-medium' 
                         style={{
                           color: Colors.primary[500],
                           marginBottom: 8,
                         }}
                       >
                         Nombre
                       </Text>
                       <Input
                         placeholder="Ingresa tu nombre"
                         value={formData.first_name}
                         onChangeText={(value) => handleInputChange('first_name', value)}
                         autoCapitalize="words"
                       />
                     </View>

                     <View>
                       <Text className='text-base font-medium' 
                         style={{
                           color: Colors.primary[500],
                           marginBottom: 8,
                         }}
                       >
                         Apellido
                       </Text>
                       <Input
                         placeholder="Ingresa tu apellido"
                         value={formData.last_name}
                         onChangeText={(value) => handleInputChange('last_name', value)}
                         autoCapitalize="words"
                       />
                     </View>

                     <View>
                       <Text className='text-base font-medium' 
                         style={{
                           color: Colors.primary[500],
                           marginBottom: 8,
                         }}
                       >
                         RUT
                       </Text>
                       <Input
                         placeholder="12.345.678-9"
                         value={formData.rut}
                         onChangeText={(value) => handleInputChange('rut', value)}
                         autoCapitalize="characters"
                         maxLength={12}
                       />
                     </View>
                   </>
                 ) : (
                   <>
                     <View>
                       <Select
                         label="País de residencia"
                         options={COUNTRY_OPTIONS}
                         value={formData.residence_country}
                         onSelect={(value) => handleInputChange('residence_country', value)}
                         placeholder="Selecciona tu país"
                       />
                     </View>

                     <View>
                       <CalendarSelect
                         label="Fecha de nacimiento"
                         value={formData.birth_date}
                         onSelect={(value: string) => handleInputChange('birth_date', value)}
                         placeholder="Selecciona tu fecha de nacimiento"
                       />
                     </View>

                     <View>
                       <Select
                         label="Ingresos mensuales"
                         options={MONTHLY_INCOME_OPTIONS}
                         value={formData.monthly_income}
                         onSelect={(value) => handleInputChange('monthly_income', value)}
                         placeholder="Selecciona tu rango de ingresos"
                       />
                       <Text className='text-sm font-regular' 
                         style={{
                           color: Colors.gray[400],
                         }}
                       >
                         Esta información nos ayuda a personalizar tus recomendaciones
                       </Text>
                     </View>
                   </>
                 )}
               </View>

             {/* Mostrar errores del servicio */}
             {serviceError && (
               <View style={{ 
                 backgroundColor: Colors.error[50], 
                 borderWidth: 1, 
                 borderColor: Colors.error[200],
                 borderRadius: 8,
                 padding: 12,
                 marginBottom: 16
               }}>
                 <Text className="text-sm font-medium" style={{ color: Colors.error[700] }}>
                   Error al enviar datos
                 </Text>
                 <Text className="text-sm font-regular" style={{ color: Colors.error[600], marginTop: 4 }}>
                   {serviceError}
                 </Text>
               </View>
             )}

            <View style={{ marginTop: 32, gap: 12 }}>
              {currentStep > 1 && (
                <Button
                  title="Atrás"
                  onPress={handlePreviousStep}
                  disabled={loading}
                  variant="outline"
                  fullWidth
                />
              )}
              
              <Button
                title={isLoading ? "Guardando..." : currentStep === 1 ? "Siguiente" : "Completar"}
                onPress={handleNextStep}
                disabled={isLoading || allErrors.length > 0}
                loading={isLoading}
                variant="primary"
                fullWidth
              />
            </View>
           </Card>
         </View>
       </ScrollView>
     </Container>
   </KeyboardAwareContainer>
 );
} 