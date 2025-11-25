import React, { useState, useEffect } from 'react';
import { View, Text, Keyboard, Alert } from 'react-native';
import { router } from 'expo-router';
import { FormLayout, Input, Select, RadioButton, LoadingSpinner, SuccessMessage } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { REGIONS_AND_COMMUNES } from '@/constants/AppConstants';
import { useAuth } from '@/providers/AuthProvider';
import { getContactInformation } from '@/services/investment/create-account/contact-information/get-contact-information';
import { createContactInformation } from '@/services/investment/create-account/contact-information/create-contact-information';
import { updateContactInformation } from '@/services/investment/create-account/contact-information/update-contact-information';
import Colors from '@/constants/Colors';

interface ContactInfoQuestion {
  id: string;
  text: string;
  subtitle?: string;
  type: 'choice' | 'input' | 'form' | 'select';
  options?: Array<{ label: string; value: string }>;
  placeholder?: string;
  dependsOn?: string;
  fields?: Array<{
    name: string;
    type: string;
    placeholder: string;
    dependsOn?: string;
    options?: string[];
  }>;
}

export default function ContactInformationStepper() {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const allQuestions = t('contactInfo.questions', { returnObjects: true }) as ContactInfoQuestion[];
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const getFilteredQuestions = () => {
    return allQuestions.filter((question) => {
      if (!question.dependsOn) {
        return true;
      }
      return !!answers[question.dependsOn];
    });
  };

  const questions = getFilteredQuestions();
  const currentQuestion = questions[currentStep];

  useEffect(() => {
    loadContactInformation();
  }, []);

  const loadContactInformation = async () => {
    if (!accessToken) {
      return;
    }

    try {
      const response = await getContactInformation(accessToken);

      if (response.success) {
        // Si success es true, el registro existe -> usar PATCH
        setHasExistingData(true);

        // Prellenar datos si existen
        if (response.contact_information) {
          const contactInfo = response.contact_information;
          const preFilledAnswers: Record<string, any> = {};

          // Los datos de dirección van anidados porque la pregunta "address" es tipo "form"
          preFilledAnswers['address'] = {
            address: contactInfo.address || '',
            region: contactInfo.location_data?.region || '',
            commune: contactInfo.location_data?.commune || '',
          };

          if (contactInfo.phones && contactInfo.phones.length > 0) {
            preFilledAnswers['phone'] = contactInfo.phones[0];
          }

          setAnswers(preFilledAnswers);
        }
      } else {
        // Si success es false, no existe registro -> usar POST
        setHasExistingData(false);
      }
    } catch {
      setHasExistingData(false);
    }
  };

  const submitContactInformation = async (finalAnswers: Record<string, any>) => {
    if (!accessToken) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Extraer datos del formulario anidado "address"
      const addressData = finalAnswers.address || {};
      const addressStreet = addressData.address || '';
      const region = addressData.region || '';
      const commune = addressData.commune || '';

      const contactInfoPayload = {
        contact_information: {
          address: addressStreet,
          address_number: '',
          phones: [finalAnswers.phone || ''],
          address_data: {
            country: 'Chile',
            state: region,
            city: commune,
            route: addressStreet,
            street_number: '',
          },
          location_data: {
            region: region,
            commune: commune,
          },
        },
      };

      let response;
      if (hasExistingData) {
        response = await updateContactInformation(accessToken, contactInfoPayload);
      } else {
        response = await createContactInformation(accessToken, contactInfoPayload);
      }

      if (response.success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          router.push('/(tabs)/investment/create-account/complete-profile');
        }, 2000);
      } else {
        Alert.alert(
          t('common.error'),
          response.message || t('contactInfo.submitError') || 'Error al guardar la información de contacto'
        );
      }
    } catch {
      Alert.alert(
        t('common.error'),
        t('contactInfo.submitError') || 'Error al guardar la información de contacto'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChoiceSelect = (value: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      submitContactInformation(newAnswers);
    }
  };

  const handleInputChange = (value: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: value });
  };

  const handleSelectChange = (value: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    if (currentQuestion.id === 'region') {
      delete newAnswers.commune;
    }
  };

  const handleFormChange = (fieldName: string, value: string) => {
    const currentFormData = answers[currentQuestion.id] || {};
    const newFormData = { ...currentFormData, [fieldName]: value };

    if (fieldName === 'region') {
      newFormData.commune = '';
    }

    setAnswers({ ...answers, [currentQuestion.id]: newFormData });
  };

  const canContinue = () => {
    const answer = answers[currentQuestion.id];

    switch (currentQuestion.type) {
      case 'choice':
        return !!answer;
      case 'input':
        return !!answer && answer.trim() !== '';
      case 'select':
        return !!answer;
      case 'form':
        if (!answer) return false;
        return currentQuestion.fields?.every((field: any) => !!answer[field.name]);
      default:
        return false;
    }
  };

  const handleContinue = () => {
    // Cerrar el teclado antes de cambiar de paso para evitar problemas de focus en Android
    Keyboard.dismiss();

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      submitContactInformation(answers);
    }
  };

  const goBack = () => {
    Keyboard.dismiss();

    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleCancel = () => {
    router.push('/(tabs)/investment/create-account/complete-profile');
  };

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'choice':
        const radioOptions = currentQuestion.options?.map((option: any) => ({
          label: option.label,
          value: option.value
        })) || [];

        return (
          <View>
            <Text className="text-base font-medium mb-6" style={{ color: Colors.primary[700] }}>
              {currentQuestion.text}
            </Text>
            <RadioButton
              options={radioOptions}
              selectedValue={answers[currentQuestion.id] || ''}
              onSelect={(value) => !isSubmitting && handleChoiceSelect(value)}
              disabled={isSubmitting}
            />
            {isSubmitting && (
              <View className="mt-4">
                <LoadingSpinner />
              </View>
            )}
          </View>
        );

      case 'input':
        return (
          <View>
            <Input
              label={currentQuestion.text}
              placeholder={currentQuestion.placeholder || ''}
              keyboardType={currentQuestion.id === 'phone' ? 'phone-pad' : currentQuestion.id === 'address_number' ? 'numeric' : 'default'}
              value={answers[currentQuestion.id] || ''}
              onChangeText={handleInputChange}
            />
          </View>
        );

      case 'select':
        let selectOptions: string[] = [];

        if (currentQuestion.id === 'region') {
          selectOptions = Object.keys(REGIONS_AND_COMMUNES);
        } else if (currentQuestion.id === 'commune' && answers['region']) {
          const regionKey = answers['region'] as keyof typeof REGIONS_AND_COMMUNES;
          selectOptions = Array.isArray(REGIONS_AND_COMMUNES[regionKey]) ? REGIONS_AND_COMMUNES[regionKey] : [];
        }

        const options = selectOptions.map(option => ({
          label: option,
          value: option
        }));

        return (
          <View>
            <Select
              label={currentQuestion.text}
              options={options}
              value={answers[currentQuestion.id] || ''}
              onSelect={handleSelectChange}
              placeholder={currentQuestion.placeholder || 'Selecciona'}
              disabled={!!(currentQuestion.dependsOn && !answers[currentQuestion.dependsOn])}
            />
          </View>
        );

      case 'form':
        const formData = answers[currentQuestion.id] || {};
        return (
          <View>
            <Text className="text-base font-medium mb-6" style={{ color: Colors.primary[700] }}>
              {currentQuestion.text}
            </Text>
            {currentQuestion.fields?.map((field: any, index: number) => {
              if (field.type === 'text') {
                return (
                  <View key={index} style={{ marginBottom: 16 }}>
                    <Input
                      placeholder={field.placeholder}
                      value={formData[field.name] || ''}
                      onChangeText={(value) => handleFormChange(field.name, value)}
                    />
                  </View>
                );
              }

              if (field.type === 'select') {
                let options: string[] = ('options' in field && field.options) ? field.options : [];

                if ('dependsOn' in field && field.dependsOn && formData[field.dependsOn]) {
                  const regionKey = formData[field.dependsOn] as keyof typeof REGIONS_AND_COMMUNES;
                  options = Array.isArray(REGIONS_AND_COMMUNES[regionKey]) ? REGIONS_AND_COMMUNES[regionKey] : [];
                }

                const selectOptions = options.map(option => ({
                  label: option,
                  value: option
                }));

                return (
                  <View key={index} style={{ marginBottom: 16 }}>
                    <Select
                      label={field.name === 'region'
                        ? t('contactInfo.regionLabel')
                        : t('contactInfo.communeLabel')}
                      options={selectOptions}
                      value={formData[field.name] || ''}
                      onSelect={(value) => handleFormChange(field.name, value)}
                      placeholder={field.placeholder}
                      disabled={!!(field.dependsOn && !formData[field.dependsOn])}
                    />
                  </View>
                );
              }

              return null;
            })}
          </View>
        );

      default:
        return null;
    }
  };


  const isLastQuestion = currentStep === questions.length - 1;

  return (
    <>
      <SuccessMessage visible={showSuccess} message="Formulario actualizado correctamente" />
      <FormLayout
        title="Información de Contacto 📍"
        subtitle=''
        currentStep={currentStep + 1}
        totalSteps={questions.length}
        onNext={currentQuestion.type === 'choice' ? undefined : canContinue() && !isSubmitting ? handleContinue : undefined}
        onPrevious={isSubmitting ? undefined : goBack}
        onCancel={currentStep === 0 ? handleCancel : undefined}
        nextButtonTitle={isSubmitting ? t('common.loading') : (isLastQuestion ? t('common.finish') : t('common.continue'))}
        cancelButtonTitle={t('common.cancel')}
        isNextDisabled={!canContinue() || isSubmitting}
        showLogo={false}
      >
        {renderQuestion()}
      </FormLayout>
    </>
  );
}
