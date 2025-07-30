import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Dimensions, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { router } from 'expo-router';
import { useKeyboardHandler } from '@/hooks/common/useKeyboardHandler';
import { useOnboarding } from '@/hooks/common/useOnboarding';
import { useAuth } from '@/providers/AuthProvider';
import { 
  Button, 
  Input, 
  Select, 
  CalendarSelect, 
  Container, 
  Card, 
  KeyboardAwareContainer 
} from '@/components/ui';
import Colors from '@/constants/Colors';
import { PatrimoreIcon } from '@/components/icons';
import { submitOnboarding } from '@/services/user/onboarding';
import { getUserData } from '@/services/user/get-user';
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
  const { markAsSeen } = useOnboarding();
  const { keyboardHeight, isKeyboardVisible } = useKeyboardHandler();
  const { accessToken } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    rut: '',
    residence_country_name: '',
    birth_date: '',
    monthly_incomes: '',
  });
  const [loading, setLoading] = useState(false);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const [isRutLocked, setIsRutLocked] = useState(false);
  const isLoading = loading || serviceLoading;
  const [errors, setErrors] = useState<string[]>([]);
  const allErrors = [...errors, ...(serviceError ? [serviceError] : [])];

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    validateStep(currentStep);
  }, [currentStep]);

  const loadUserData = async () => {
    if (!accessToken) {
      setIsLoadingUserData(false);
      return;
    }

    try {
      const userResponse = await getUserData(accessToken);
      
      if (userResponse?.user?.personal_information) {
        const personalInfo = userResponse.user.personal_information;
        
        if (personalInfo.rut && personalInfo.rut.trim() !== '') {
          setIsRutLocked(true);
        }
        
        let birthDate = personalInfo.birth_date;
        if (birthDate && birthDate.includes('-')) {
          const parts = birthDate.split('-');
          if (parts.length === 3) {
            birthDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
          }
        }
        
        let monthlyIncomesValue = '';
        if (typeof personalInfo.monthly_incomes === 'number') {
          if (personalInfo.monthly_incomes < 1000000) {
            monthlyIncomesValue = 'less_than_1_millon';
          } else if (personalInfo.monthly_incomes < 5000000) {
            monthlyIncomesValue = 'between_1_and_5_millons';
          } else if (personalInfo.monthly_incomes < 10000000) {
            monthlyIncomesValue = 'between_5_and_10_millons';
          } else if (personalInfo.monthly_incomes < 25000000) {
            monthlyIncomesValue = 'between_10_and_25_millons';
          } else {
            monthlyIncomesValue = 'greater_than_25_millons';
          }
        } else {
          monthlyIncomesValue = personalInfo.monthly_incomes || '';
        }
        
        const newFormData = {
          first_name: personalInfo.first_name || '',
          last_name: personalInfo.last_name || '',
          rut: personalInfo.rut || '',
          residence_country_name: personalInfo.residence_country_name || '',
          birth_date: birthDate || '',
          monthly_incomes: monthlyIncomesValue || '',
        };
        
        setFormData(newFormData);
        
        setTimeout(() => {
          const currentStepErrors = validateStepWithData(currentStep, newFormData);
          const step2Errors = validateStepWithData(2, newFormData);
          
          if (currentStep === 1 && currentStepErrors.length === 0) {
            setErrors([]);
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoadingUserData(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [field]: value,
      };
      
      setTimeout(() => {
        validateStepWithData(currentStep, newFormData);
      }, 100);
      
      return newFormData;
    });
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [field]: value,
      };
      
      setTimeout(() => {
        validateStepWithData(currentStep, newFormData);
      }, 100);
      
      return newFormData;
    });
  };

  const handleRUTChange = (value: string) => {
    if (value.trim() === '') {
      setFormData(prev => ({
        ...prev,
        rut: '',
      }));
      return;
    }
    
    const cleanValue = value.replace(/[^0-9kK-]/g, '');
    
    if (cleanValue.length === 0) {
      return;
    }
    
    if (cleanValue.length > 10) {
      return;
    }
    
    setFormData(prev => {
      const newFormData = {
        ...prev,
        rut: cleanValue.toUpperCase(),
      };
      
      setTimeout(() => {
        validateStepWithData(currentStep, newFormData);
      }, 100);
      
      return newFormData;
    });
  };

  const formatRUTForBackend = (rut: string): string => {
    const cleanRut = rut.replace(/[^0-9kK]/g, '');
    
    if (cleanRut.length < 2) {
      return cleanRut.toUpperCase();
    }
    
    const body = cleanRut.slice(0, -1);
    const digit = cleanRut.slice(-1);
    
    let formattedBody = '';
    for (let i = body.length - 1, j = 0; i >= 0; i--, j++) {
      if (j > 0 && j % 3 === 0) {
        formattedBody = '.' + formattedBody;
      }
      formattedBody = body[i] + formattedBody;
    }
    
    return formattedBody + '-' + digit.toUpperCase();
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

  const validateStepWithData = (step: number, data: typeof formData) => {
    const newErrors = [];
    
    if (step === 1) {
      if (!data.first_name.trim()) {
        newErrors.push('El nombre es requerido');
      }
      
      if (!data.last_name.trim()) {
        newErrors.push('El apellido es requerido');
      }
      
      if (!data.rut.trim()) {
        newErrors.push('El RUT es requerido');
      } else if (data.rut.length < 3) {
        newErrors.push('El RUT debe tener al menos 3 caracteres');
      }
    } else if (step === 2) {
      if (!data.residence_country_name.trim()) {
        newErrors.push('El país de residencia es requerido');
      }
      
      if (!data.birth_date.trim()) {
        newErrors.push('La fecha de nacimiento es requerida');
      }
      
      if (!data.monthly_incomes.trim()) {
        newErrors.push('Los ingresos mensuales son requeridos');
      }
    }
    
    if (step === currentStep) {
      setErrors(newErrors);
    }
    
    return newErrors;
  };

  const validateStep = (step: number) => {
    return validateStepWithData(step, formData);
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
    
    if (!formData.residence_country_name.trim()) {
      newErrors.push('El país de residencia es requerido');
    }
    
    if (!formData.birth_date.trim()) {
      newErrors.push('La fecha de nacimiento es requerida');
    }
    
    if (!formData.monthly_incomes.trim()) {
      newErrors.push('Los ingresos mensuales son requeridos');
    }
    
    setErrors(newErrors);
    return newErrors;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      const step1Errors = validateStepWithData(1, formData);
      if (step1Errors.length > 0) {
        setErrors(step1Errors);
        return;
      }
      
      setTimeout(() => {
        const step2Errors = validateStepWithData(2, formData);
        if (step2Errors.length === 0) {
          setErrors([]);
        }
      }, 100);
      
      setCurrentStep(2);
      setErrors([]);
    } else {
      handleComplete();
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
  };

  const handleComplete = async () => {
    setLoading(true);
    setServiceError(null);
    
    try {
      const formErrors = validateForm();
      
      if (formErrors.length > 0) {
        throw new Error(formErrors.join(', '));
      }

      const onboardingData = {
        personal_information: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          rut: formatRUTForBackend(formData.rut),
          birth_date: convertDateFormat(formData.birth_date),
          monthly_incomes: formData.monthly_incomes,
          residence_country_name: formData.residence_country_name,
        }
      };

      if (!accessToken) {
        throw new Error('No hay token de autenticación disponible');
      }

      const response = await submitOnboarding(accessToken, onboardingData);
      
      if (response) {
        await AsyncStorage.setItem('onboarding_completed', 'true');
        await markAsSeen();
        router.replace('/(tabs)/patrimony');
      }
    } catch (error) {
      console.error('Error in handleComplete:', error);
      setServiceError(error instanceof Error ? error.message : 'Error desconocido');
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
          {isLoadingUserData ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={Colors.secondary[500]} />
              <Text 
                className="text-base font-medium mt-4"
                style={{ color: Colors.primary[500] }}
              >
                Cargando datos del usuario...
              </Text>
            </View>
          ) : (
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
                             color: isRutLocked ? Colors.gray[400] : Colors.primary[500],
                             marginBottom: 8,
                           }}
                         >
                           RUT
                         </Text>
                         <Input
                           placeholder="12345678-9"
                           value={formData.rut}
                           onChangeText={handleRUTChange}
                           autoCapitalize="characters"
                           maxLength={10}
                           keyboardType="default"
                           returnKeyType="next"
                           clearButtonMode="while-editing"
                           disabled={isRutLocked}
                         />
                       </View>
                     </>
                   ) : (
                     <>
                       <View>
                         <Select
                           label="País de residencia"
                           options={COUNTRY_OPTIONS}
                           value={formData.residence_country_name}
                           onSelect={(value) => handleSelectChange('residence_country_name', value)}
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
                           value={formData.monthly_incomes}
                           onSelect={(value) => handleSelectChange('monthly_incomes', value)}
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
          )}
        </ScrollView>
      </Container>
    </KeyboardAwareContainer>
  );
} 