import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useUserData } from '@/hooks/user/useUserData';
import { useOnboarding } from '@/hooks/user/useOnboarding';
import { submitOnboarding } from '@/services/user/onboarding';
import { validateRut, cleanRutForBackend, formatRutWhileTyping } from '@/utils/rut-validation';
import {
  Container,
  Input,
  Select,
  KeyboardAwareContainer,
  Button,
  Card,
  CalendarSelect,
  InfoTooltip
} from '@/components/ui';
import Colors from '@/constants/Colors';
import { PatrimoreIcon } from '@/components/icons';
import { getUserData } from '@/services/user/get-user';
import { useKeyboardHandler } from '@/hooks/common/useKeyboardHandler';
import { useOnboarding as useOnboardingCommon } from '@/hooks/common/useOnboarding';

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
  const { accessToken } = useAuth();
  const { userData, loading: isLoadingUserData } = useUserData();
  const { submitOnboardingData, loading: isSubmitting, error: serviceError, success } = useOnboarding();
  const { markAsCompleted } = useOnboardingCommon();
  const { isKeyboardVisible, keyboardHeight } = useKeyboardHandler();
  
  const [formData, setFormData] = useState({
    rut: '',
    residence_country_name: '',
    birth_date: '',
    monthly_incomes: '',
  });
  const [loading, setLoading] = useState(false);
  const [isRutLocked, setIsRutLocked] = useState(false);
  const isLoading = loading || isSubmitting;
  const [errors, setErrors] = useState<string[]>([]);
  const allErrors = [...errors, ...(serviceError ? [serviceError] : [])];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    if (!accessToken) {
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
          rut: personalInfo.rut || '',
          residence_country_name: personalInfo.residence_country_name || '',
          birth_date: birthDate || '',
          monthly_incomes: monthlyIncomesValue || '',
        };
        
        setFormData(newFormData);
      }
    } catch (error) {
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [field]: value,
      };
      
      setTimeout(() => {
        validateFormWithData(newFormData);
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
        validateFormWithData(newFormData);
      }, 100);
      
      return newFormData;
    });
  };

  const handleRUTChange = (value: string) => {
    const formattedValue = formatRutWhileTyping(value);
    
    setFormData(prev => {
      const newFormData = {
        ...prev,
        rut: formattedValue,
      };
      
      setTimeout(() => {
        validateFormWithData(newFormData);
      }, 100);
      
      return newFormData;
    });
  };

  const formatRUTForBackend = (rut: string): string => {
    return cleanRutForBackend(rut);
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

  const validateFormWithData = (data: typeof formData) => {
    const newErrors = [];
    
    if (!data.rut.trim()) {
      newErrors.push('El RUT es requerido');
    } else {
      const rutValidation = validateRut(data.rut);
      if (!rutValidation.isValid) {
        newErrors.push(rutValidation.error || 'El RUT ingresado no es válido');
      }
    }
    
    if (!data.residence_country_name.trim()) {
      newErrors.push('El país de residencia es requerido');
    }
    
    if (!data.birth_date.trim()) {
      newErrors.push('La fecha de nacimiento es requerida');
    }
    
    if (!data.monthly_incomes.trim()) {
      newErrors.push('Los ingresos mensuales son requeridos');
    }
    
    setErrors(newErrors);
    return newErrors;
  };

  const isFormValid = () => {
    return formData.rut.trim() !== '' &&
           formData.residence_country_name.trim() !== '' &&
           formData.birth_date.trim() !== '' &&
           formData.monthly_incomes.trim() !== '' &&
           allErrors.length === 0;
  };

  const validateForm = () => {
    return validateFormWithData(formData);
  };

  const handleComplete = async () => {
    setLoading(true);
    
    try {
      const formErrors = validateForm();
      
      if (formErrors.length > 0) {
        throw new Error(formErrors.join(', '));
      }

      const onboardingData = {
        personal_information: {
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
        await markAsCompleted();
        router.replace('/(tabs)/patrimony');
      }
    } catch (error) {
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
                <PatrimoreIcon width={140} height={50} color={Colors.secondary[500]} />
              </View>

              <Card style={{ padding: 24, marginBottom: 24 }}>
                <View style={{ marginBottom: 24 }}>
                  <Text className='font-medium text-2xl'
                    style={{
                      color: Colors.primary[700],
                      textAlign: 'center',
                      marginBottom: 8,
                    }}
                  >
                    Información Personal
                  </Text>
                  <Text className='text-base font-regular text-center'
                    style={{
                      color: Colors.primary[500],
                      textAlign: 'center',
                    }}
                  >
                    Ayúdanos a personalizar tu experiencia 😎
                  </Text>
                </View>

                <View style={{ gap: 20 }}>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Text className='text-base font-medium' 
                        style={{
                          color: isRutLocked ? Colors.gray[400] : Colors.primary[500],
                        }}
                      >
                        RUT
                      </Text>
                        <InfoTooltip 
                         info="El RUT es tu identificación única en Chile. Lo necesitamos para verificar tu identidad y ofrecerte servicios personalizados."
                         disabled={isRutLocked}
                       />
                    </View>
                    <Input
                      placeholder="12345678-9"
                      value={formData.rut}
                      onChangeText={handleRUTChange}
                      autoCapitalize="characters"
                      maxLength={12}
                      keyboardType="default"
                      returnKeyType="next"
                      clearButtonMode="while-editing"
                      disabled={isRutLocked}
                    />
                  </View>

                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Text className='text-base font-medium' 
                        style={{
                          color: Colors.primary[500],
                        }}
                      >
                        País de residencia
                      </Text>
                      <InfoTooltip 
                        info="Necesitamos conocer tu país de residencia para adaptar nuestros servicios y recomendaciones a tu ubicación geográfica."
                      />
                    </View>
                    <Select
                      options={COUNTRY_OPTIONS}
                      value={formData.residence_country_name}
                      onSelect={(value) => handleSelectChange('residence_country_name', value)}
                      placeholder="Selecciona tu país"
                    />
                  </View>

                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Text className='text-base font-medium' 
                        style={{
                          color: Colors.primary[500],
                        }}
                      >
                        Fecha de nacimiento
                      </Text>
                      <InfoTooltip 
                        info="Tu fecha de nacimiento nos ayuda a calcular tu edad y ofrecerte recomendaciones financieras apropiadas para tu etapa de vida."
                      />
                    </View>
                    <CalendarSelect
                      value={formData.birth_date}
                      onSelect={(value: string) => handleInputChange('birth_date', value)}
                      placeholder="Selecciona tu fecha de nacimiento"
                    />
                  </View>

                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Text className='text-base font-medium' 
                        style={{
                          color: Colors.primary[500],
                        }}
                      >
                        Ingresos mensuales
                      </Text>
                      <InfoTooltip 
                        info="Conocer tu rango de ingresos nos permite ofrecerte recomendaciones financieras más precisas y productos adecuados a tu capacidad económica."
                      />
                    </View>
                    <Select
                      options={MONTHLY_INCOME_OPTIONS}
                      value={formData.monthly_incomes}
                      onSelect={(value) => handleSelectChange('monthly_incomes', value)}
                      placeholder="Selecciona tu rango de ingresos"
                    />
                  </View>
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

                <View style={{ marginTop: 32 }}>
                  <Button
                    title={isLoading ? "Guardando..." : "Completar"}
                    onPress={handleComplete}
                    disabled={isLoading || !isFormValid()}
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