import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { FormLayout } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { REGIONS_AND_COMMUNES } from '@/constants/AppConstants';
import { useAuth } from '@/providers/AuthProvider';
import { getContactInformation } from '@/services/investment/create-account/contact-information/get-contact-information';
import { createContactInformation } from '@/services/investment/create-account/contact-information/create-contact-information';
import { updateContactInformation } from '@/services/investment/create-account/contact-information/update-contact-information';

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
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);

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
      setIsLoading(false);
      return;
    }

    try {
      const response = await getContactInformation(accessToken);
      console.log('GET contact information response:', response);

      if (response.success && response.contact_information) {
        const contactInfo = response.contact_information;
        console.log('Contact info from API:', contactInfo);

        const hasAnyData = !!(
          contactInfo.address ||
          contactInfo.address_number ||
          contactInfo.floor_number ||
          (contactInfo.phones && contactInfo.phones.length > 0 && contactInfo.phones[0]) ||
          contactInfo.location_data?.region ||
          contactInfo.location_data?.commune ||
          contactInfo.address_data?.country ||
          contactInfo.address_data?.state ||
          contactInfo.address_data?.city
        );

        console.log('Has any existing data:', hasAnyData);
        setHasExistingData(hasAnyData);

        if (hasAnyData) {
          const preFilledAnswers: Record<string, any> = {};

          if (contactInfo.address) {
            preFilledAnswers['address'] = contactInfo.address;
          }
          if (contactInfo.floor_number) {
            preFilledAnswers['address_number'] = contactInfo.floor_number;
          }
          if (contactInfo.phones && contactInfo.phones.length > 0) {
            preFilledAnswers['phone'] = contactInfo.phones[0];
          }
          if (contactInfo.location_data?.region) {
            preFilledAnswers['region'] = contactInfo.location_data.region;
          }
          if (contactInfo.location_data?.commune) {
            preFilledAnswers['commune'] = contactInfo.location_data.commune;
          }

          console.log('Pre-filled answers:', preFilledAnswers);
          setAnswers(preFilledAnswers);
        }
      } else {
        console.log('No contact information found or request failed');
        setHasExistingData(false);
      }
    } catch (error) {
      console.error('Error loading contact information:', error);
      setHasExistingData(false);
    } finally {
      setIsLoading(false);
    }
  };

  const submitContactInformation = async (finalAnswers: Record<string, any>) => {
    if (!accessToken) {
      console.error('No access token available');
      return;
    }

    setIsSubmitting(true);
    try {
      const contactInfoPayload = {
        contact_information: {
          address: finalAnswers.address || '',
          address_number: finalAnswers.address_number || '',
          phones: [finalAnswers.phone || ''],
          address_data: {
            country: 'Chile',
            state: finalAnswers.region || '',
            city: finalAnswers.commune || '',
            route: finalAnswers.address || '',
            street_number: finalAnswers.address_number || '',
          },
          location_data: {
            region: finalAnswers.region || '',
            commune: finalAnswers.commune || '',
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
        router.push('/(tabs)/investment/create-account/summary');
      } else {
        console.error('Error submitting contact information:', response.message);
      }
    } catch (error) {
      console.error('Error submitting contact information:', error);
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
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      submitContactInformation(answers);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'choice':
        return (
          <View>
            {currentQuestion.options?.map((option: any, index: number) => (
              <TouchableOpacity
                key={index}
                className="bg-gray-100 p-3 rounded-lg mb-3"
                onPress={() => !isSubmitting && handleChoiceSelect(option.value)}
                disabled={isSubmitting}
              >
                <Text className="text-base text-gray-800">{option.label}</Text>
              </TouchableOpacity>
            ))}
            {isSubmitting && (
              <View className="mt-4 items-center">
                <ActivityIndicator size="large" color="#0066CC" />
                <Text className="mt-2 text-gray-600">{t('common.loading')}</Text>
              </View>
            )}
          </View>
        );

      case 'input':
        return (
          <View>
            <TextInput
              placeholder={currentQuestion.placeholder || ''}
              keyboardType={currentQuestion.id === 'phone' ? 'phone-pad' : currentQuestion.id === 'address_number' ? 'numeric' : 'default'}
              value={answers[currentQuestion.id] || ''}
              onChangeText={handleInputChange}
              className="bg-gray-100 p-3 rounded-lg mb-3"
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

        return (
          <View>
            <View className="bg-gray-100 rounded-lg">
              <Picker
                selectedValue={answers[currentQuestion.id] || ''}
                onValueChange={handleSelectChange}
                style={{ height: 50 }}
                enabled={!currentQuestion.dependsOn || !!answers[currentQuestion.dependsOn]}
              >
                <Picker.Item label={currentQuestion.placeholder || 'Selecciona'} value="" />
                {selectOptions.map((option: string, idx: number) => (
                  <Picker.Item key={idx} label={option} value={option} />
                ))}
              </Picker>
            </View>
          </View>
        );

      case 'form':
        const formData = answers[currentQuestion.id] || {};
        return (
          <View>
            {currentQuestion.fields?.map((field: any, index: number) => {
              if (field.type === 'text') {
                return (
                  <TextInput
                    key={index}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ''}
                    onChangeText={(value) => handleFormChange(field.name, value)}
                    className="bg-gray-100 p-3 rounded-lg mb-3"
                  />
                );
              }

              if (field.type === 'select') {
                let options: string[] = ('options' in field && field.options) ? field.options : [];

                if ('dependsOn' in field && field.dependsOn && formData[field.dependsOn]) {
                  const regionKey = formData[field.dependsOn] as keyof typeof REGIONS_AND_COMMUNES;
                  options = Array.isArray(REGIONS_AND_COMMUNES[regionKey]) ? REGIONS_AND_COMMUNES[regionKey] : [];
                }

                return (
                  <View key={index} className="mb-3">
                    <Text className="font-medium mb-1">
                      {field.name === 'region'
                        ? t('contactInfo.regionLabel')
                        : t('contactInfo.communeLabel')}
                    </Text>
                    <View className="bg-gray-100 rounded-lg">
                      <Picker
                        selectedValue={formData[field.name] || ''}
                        onValueChange={(value) => handleFormChange(field.name, value)}
                        style={{ height: 50 }}
                        enabled={!field.dependsOn || !!formData[field.dependsOn]}
                      >
                        <Picker.Item label={field.placeholder} value="" />
                        {options.map((option: string, idx: number) => (
                          <Picker.Item key={idx} label={option} value={option} />
                        ))}
                      </Picker>
                    </View>
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

  if (isLoading) {
    return (
      <FormLayout
        title={t('common.loading')}
        subtitle=""
        currentStep={0}
        totalSteps={0}
        showLogo={false}
      >
        <View className="items-center justify-center py-10">
          <ActivityIndicator size="large" color="#0066CC" />
        </View>
      </FormLayout>
    );
  }

  return (
    <FormLayout
      title={currentQuestion.text}
      subtitle={currentQuestion.subtitle || ''}
      currentStep={0}
      totalSteps={0}
      onNext={currentQuestion.type === 'choice' ? undefined : canContinue() && !isSubmitting ? handleContinue : undefined}
      onPrevious={isSubmitting ? undefined : goBack}
      nextButtonTitle={isSubmitting ? t('common.loading') : t('common.continue')}
      isNextDisabled={!canContinue() || isSubmitting}
      showLogo={false}
    >

      <View className="flex-row mb-6">
        {questions.map((_, index) => (
          <View
            key={index}
            className={`flex-1 h-1 mx-1 rounded ${
              index <= currentStep ? 'bg-primary-500' : 'bg-gray-200'
            }`}
          />
        ))}
      </View>

      {renderQuestion()}
    </FormLayout>
  );
}
