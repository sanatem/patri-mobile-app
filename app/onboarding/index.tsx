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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const { height } = Dimensions.get('window');


export default function OnboardingScreen() {
  const { t } = useTranslation();

 const MONTHLY_INCOME_OPTIONS = [
    { value: 'less_than_1_millon', label: t('onboarding.incomeOptions.lessThan1M') },
    { value: 'between_1_and_5_millons', label: t('onboarding.incomeOptions.between1And5M') },
    { value: 'between_5_and_10_millons', label: t('onboarding.incomeOptions.between5And10M') },
    { value: 'between_10_and_25_millons', label: t('onboarding.incomeOptions.between10And25M') },
    { value: 'greater_than_25_millons', label: t('onboarding.incomeOptions.greaterThan25M') },
  ];

  const COUNTRY_OPTIONS = [
    { value: 'Chile', label: t('countries.chile') },
    { value: 'Argentina', label: t('countries.argentina') },
    { value: 'Brasil', label: t('countries.brazil') },
    { value: 'Colombia', label: t('countries.colombia') },
    { value: 'México', label: t('countries.mexico') },
    { value: 'Perú', label: t('countries.peru') },
    { value: 'Uruguay', label: t('countries.uruguay') },
    { value: 'Estados Unidos', label: t('countries.usa') },
    { value: 'España', label: t('countries.spain') },
    { value: 'Otro', label: t('countries.other') }
  ];
  const { markAsSeen } = useOnboarding();
  const { keyboardHeight, isKeyboardVisible } = useKeyboardHandler();
  const { accessToken } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    rut: '',
    residence_country: '',
    birth_date: '',
    monthly_incomes: '',
  });
  const [loading, setLoading] = useState(false);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const isLoading = loading || serviceLoading;
  const [errors, setErrors] = useState<string[]>([]);
  const allErrors = [...errors, ...(serviceError ? [serviceError] : [])];

  useEffect(() => {
    validateStep(currentStep);
  }, [currentStep]);

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
      if (!data.first_name.trim()) newErrors.push(t('onboarding.errors.firstNameRequired'));
      if (!data.last_name.trim()) newErrors.push(t('onboarding.errors.lastNameRequired'));
      if (!data.rut.trim()) {
        newErrors.push(t('onboarding.errors.rutRequired'));
      } else if (data.rut.length < 3) {
        newErrors.push(t('onboarding.errors.rutMinLength'));
      }
    } else if (step === 2) {
      if (!data.residence_country.trim()) newErrors.push(t('onboarding.errors.countryRequired'));
      if (!data.birth_date.trim()) newErrors.push(t('onboarding.errors.birthDateRequired'));
      if (!data.monthly_incomes.trim()) newErrors.push(t('onboarding.errors.incomeRequired'));
    }
    setErrors(newErrors);
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
    
    if (!formData.residence_country.trim()) {
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
    const stepErrors = validateStep(currentStep);
    
    if (stepErrors.length === 0) {
      if (currentStep === 1) {
        setCurrentStep(2);
      } else {
        handleComplete();
      }
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
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
          first_name: formData.first_name,
          last_name: formData.last_name,
          rut: formatRUTForBackend(formData.rut),
          birth_date: convertDateFormat(formData.birth_date),
          monthly_incomes: formData.monthly_incomes,
          residence_country: formData.residence_country,
        }
      };

      if (!accessToken) {
        throw new Error('No hay token de autenticación disponible');
      }

      const response = await submitOnboarding(accessToken, onboardingData);
      
      if (response) {
        await markAsSeen();
        await AsyncStorage.setItem('onboarding_completed', 'true');
        router.replace('/(tabs)/patrimony');
      }
    } catch (error) {
      console.error('Error in handleComplete:', error);
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
                  {t(currentStep === 1 ? 'onboarding.titleStep1' : 'onboarding.titleStep2')}
                </Text>
                <Text className='text-base font-regular text-center'
                  style={{
                    color: Colors.primary[500],
                    textAlign: 'center',
                  }}
                >
                  {t(currentStep === 1 ? 'onboarding.subtitleStep1' : 'onboarding.subtitleStep2')}
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
                          {t('onboarding.firstNameLabel')}
                        </Text>
                        <Input
                          placeholder={t('onboarding.firstNamePlaceholder')}
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
                        {t('onboarding.lastNameLabel')}
                      </Text>
                      <Input
                        placeholder={t('onboarding.lastNamePlaceholder')}
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
                        {t('onboarding.rutLabel')}
                      </Text>
                      <Input
                        placeholder={t('onboarding.rutPlaceholder')}
                        value={formData.rut}
                        onChangeText={handleRUTChange}
                        autoCapitalize="characters"
                        maxLength={10}
                        keyboardType="default"
                        returnKeyType="next"
                        clearButtonMode="while-editing"
                      />
                    </View>
                  </>
                ) : (
                  <>
                  <View>
                    <Select
                      label={t('onboarding.countryLabel')}
                      options={COUNTRY_OPTIONS}
                      value={formData.residence_country}
                      onSelect={(value) => handleSelectChange('residence_country', value)}
                      placeholder={t('onboarding.countryPlaceholder')}
                    />
                  </View>

                  <View>
                    <CalendarSelect
                      label={t('onboarding.birthLabel')}
                      value={formData.birth_date}
                      onSelect={(value: string) => handleInputChange('birth_date', value)}
                      placeholder={t('onboarding.birthPlaceholder')}
                    />
                  </View>

                  <View>
                      <Select
                        label={t('onboarding.incomeLabel')}
                        options={MONTHLY_INCOME_OPTIONS}
                        value={formData.monthly_incomes}
                        onSelect={(value) => handleSelectChange('monthly_incomes', value)}
                        placeholder={t('onboarding.incomePlaceholder')}
                      />
                      <Text className='text-sm font-regular' 
                      style={{ 
                        color: Colors.gray[400],
                        }}
                        >
                        {t('onboarding.incomeNote')}
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
                    {t('onboarding.serviceError.title')}
                  </Text>
                  <Text className="text-sm font-regular" style={{ color: Colors.error[600], marginTop: 4 }}>
                    {serviceError}
                  </Text>
                </View>
              )}

              <View style={{ marginTop: 32, gap: 12 }}>
                {currentStep > 1 && (
                  <Button
                    title={t('common.back')}
                    onPress={handlePreviousStep}
                    disabled={loading}
                    variant="outline"
                    fullWidth
                  />
                )}
                <Button
                  title={
                    isLoading
                      ? t('common.saving')
                      : currentStep === 1
                        ? t('common.next')
                        : t('common.finish')
                  }
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