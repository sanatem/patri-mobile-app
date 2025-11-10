import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { FormLayout, Button, Input, Select, RadioButton } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { REGIONS_AND_COMMUNES } from '@/constants/AppConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ExtractedPersonalData } from '@/services/id-analyzer';
import { useAuth } from '@/providers/AuthProvider';
import { updatePersonalInformation } from '@/services/investment/create-account/personal-information/update-personal-information';
import Colors from '@/constants/Colors';

interface PersonalInfoQuestion {
  id: string;
  text: string;
  textFeminine?: string;
  textMasculine?: string;
  textNoBinary?: string;
  subtitle?: string;
  type: 'choice' | 'input' | 'form';
  options?: Array<{
    label: string;
    labelFeminine?: string;
    labelMasculine?: string;
    labelNoBinary?: string;
    value: string;
  }>;
  placeholder?: string;
  dependsOn?: string;
  showWhen?: string;
  fields?: Array<{
    name: string;
    type: string;
    placeholder: string;
    dependsOn?: string;
    options?: string[];
  }>;
}

export default function PersonalInformationStepper() {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const allQuestions = t('personalInfo.questions', { returnObjects: true }) as PersonalInfoQuestion[];
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [extractedData, setExtractedData] = useState<ExtractedPersonalData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getFilteredQuestions = () => {
    return allQuestions.filter((question) => {
      if (!question.dependsOn || !question.showWhen) {
        return true;
      }
      return answers[question.dependsOn] === question.showWhen;
    });
  };

  const questions = getFilteredQuestions();
  const currentQuestion = questions[currentStep];
  const selectedGender = answers['gender'];

  const getGenderedText = (question: PersonalInfoQuestion) => {
    if (selectedGender === 'feminine' && question.textFeminine) {
      return question.textFeminine;
    } else if (selectedGender === 'masculine' && question.textMasculine) {
      return question.textMasculine;
    } else if (selectedGender === 'no_binary' && question.textNoBinary) {
      return question.textNoBinary;
    }
    return question.text;
  };
  
  const getGenderedLabel = (option: any) => {
    if (selectedGender === 'feminine' && option.labelFeminine) {
      return option.labelFeminine;
    } else if (selectedGender === 'masculine' && option.labelMasculine) {
      return option.labelMasculine;
    } else if (selectedGender === 'no_binary' && option.labelNoBinary) {
      return option.labelNoBinary;
    }
    return option.label;
  };

  useEffect(() => {
    loadExtractedData();
  }, []);

  const loadExtractedData = async () => {
    try {
      const data = await AsyncStorage.getItem('extracted_personal_data');
      if (data) {
        const parsed: ExtractedPersonalData = JSON.parse(data);
        setExtractedData(parsed);
        
        const preFilledAnswers: Record<string, any> = {};

        if (parsed.firstName) {
          preFilledAnswers['firstName'] = parsed.firstName;
        }
        if (parsed.lastName) {
          preFilledAnswers['lastName'] = parsed.lastName;
        }
        if (parsed.dateOfBirth) {
          preFilledAnswers['dateOfBirth'] = parsed.dateOfBirth;
        }
        if (parsed.nationality) {
          preFilledAnswers['nationality'] = parsed.nationality;
        }
        if (parsed.documentNumber) {
          preFilledAnswers['documentNumber'] = parsed.documentNumber;
        }
        
        setAnswers(preFilledAnswers);
        
        await AsyncStorage.removeItem('extracted_personal_data');
      }
    } catch (error) {
    }
  };

  const submitPersonalInformation = async (finalAnswers: Record<string, any>) => {
    if (!accessToken) {
      console.error('No access token available');
      return;
    }

    setIsSubmitting(true);
    try {
      const personalInfoData = {
        sex: finalAnswers.sex || undefined,
        gender: finalAnswers.gender || undefined,
        employment_situation: finalAnswers.employment_situation || undefined,
        marital_status: finalAnswers.marital_status || undefined,
        conjugal_regime: finalAnswers.conjugal_regime || undefined,
        us_person: finalAnswers.us_person === 'si',
        pep: finalAnswers.pep === 'si',
        has_broker_relationship_with_vector: finalAnswers.has_broker_relationship_with_vector === 'si',
        broker_relationship_type: finalAnswers.broker_relationship_type || undefined,
        has_a_broker_relationship: finalAnswers.has_a_broker_relationship === 'si',
      };

      const response = await updatePersonalInformation(accessToken, personalInfoData);

      if (response.success) {
        router.push('/(tabs)/investment/create-account/summary');
      } else {
        console.error('Error updating personal information:', response.message);
      }
    } catch (error) {
      console.error('Error submitting personal information:', error);
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
      submitPersonalInformation(newAnswers);
    }
  };

  const handleInputChange = (value: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: value });
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
      submitPersonalInformation(answers);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'choice':
        const radioOptions = currentQuestion.options?.map((option: any) => ({
          label: getGenderedLabel(option),
          value: option.value
        })) || [];

        return (
          <View>
            <RadioButton
              options={radioOptions}
              selectedValue={answers[currentQuestion.id] || ''}
              onSelect={(value) => !isSubmitting && handleChoiceSelect(value)}
              disabled={isSubmitting}
            />
            {isSubmitting && (
              <View className="mt-4 items-center">
                <ActivityIndicator size="large" color={Colors.secondary[500]} />
              </View>
            )}
          </View>
        );

      case 'input':
        return (
          <View>
            <Input
              placeholder={currentQuestion.placeholder || ''}
              keyboardType="phone-pad"
              value={answers[currentQuestion.id] || ''}
              onChangeText={handleInputChange}
            />
          </View>
        );

      case 'form':
        const formData = answers[currentQuestion.id] || {};
        return (
          <View>
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
                        ? t('personalInfo.regionLabel')
                        : t('personalInfo.communeLabel')}
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

  return (
    <FormLayout
      title={getGenderedText(currentQuestion)}
      subtitle=''
      currentStep={0}
      totalSteps={0}
      onNext={currentQuestion.type === 'choice' ? undefined : canContinue() && !isSubmitting ? handleContinue : undefined}
      onPrevious={isSubmitting ? undefined : goBack}
      onCancel={currentStep === 0 ? handleCancel : undefined}
      nextButtonTitle={isSubmitting ? t('common.loading') : t('common.continue')}
      cancelButtonTitle={t('common.cancel')}
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