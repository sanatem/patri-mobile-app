import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { FormLayout, Input, LoadingSpinner, SuccessMessage } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/providers/AuthProvider';
import { getEmploymentInformation } from '@/services/investment/create-account/employment-information/get-employment-information';
import { createEmploymentInformation } from '@/services/investment/create-account/employment-information/create-employment-information';
import { updateEmploymentInformation } from '@/services/investment/create-account/employment-information/update-employment-information';
import { validateRut } from '@/utils/rut-validation';
import Colors from '@/constants/Colors';

interface EmploymentInfoQuestion {
  id: string;
  text: string;
  subtitle?: string;
  type: 'input';
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
  validation?: 'rut';
}

export default function EmploymentInformationStepper() {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const allQuestions = t('employmentInfo.questions', { returnObjects: true }) as EmploymentInfoQuestion[];
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const questions = allQuestions;
  const currentQuestion = questions[currentStep];

  useEffect(() => {
    loadEmploymentInformation();
  }, []);

  const loadEmploymentInformation = async () => {
    if (!accessToken) {
      return;
    }

    try {
      const response = await getEmploymentInformation(accessToken);
      console.log('GET employment information response:', response);

      if (response.success && response.employment_information) {
        const employmentInfo = response.employment_information;
        console.log('Employment info from API:', employmentInfo);

        // Check if at least one field has data
        const hasAnyData = !!(
          employmentInfo.company_name ||
          employmentInfo.company_rut ||
          employmentInfo.charge ||
          employmentInfo.profession ||
          employmentInfo.commercial_activity
        );

        console.log('Has any existing data:', hasAnyData);
        setHasExistingData(hasAnyData);

        if (hasAnyData) {
          const preFilledAnswers: Record<string, any> = {};

          // Map employment information to question IDs
          if (employmentInfo.company_name) {
            preFilledAnswers['company_name'] = employmentInfo.company_name;
          }
          if (employmentInfo.company_rut) {
            preFilledAnswers['company_rut'] = employmentInfo.company_rut;
          }
          if (employmentInfo.charge) {
            preFilledAnswers['charge'] = employmentInfo.charge;
          }
          if (employmentInfo.profession) {
            preFilledAnswers['profession'] = employmentInfo.profession;
          }
          if (employmentInfo.commercial_activity) {
            preFilledAnswers['commercial_activity'] = employmentInfo.commercial_activity;
          }

          console.log('Pre-filled answers:', preFilledAnswers);
          setAnswers(preFilledAnswers);
        }
      } else {
        console.log('No employment information found or request failed');
        setHasExistingData(false);
      }
    } catch (error) {
      console.error('Error loading employment information:', error);
      setHasExistingData(false);
    }
  };

  const validateCurrentAnswer = (value: string): string | null => {
    if (!value || value.trim() === '') {
      return t('employmentInfo.errors.required');
    }

    // RUT validation for company_rut
    if (currentQuestion.validation === 'rut') {
      const rutValidation = validateRut(value);
      if (!rutValidation.isValid) {
        return rutValidation.error || t('employmentInfo.errors.invalidRut');
      }
    }

    return null;
  };

  const submitEmploymentInformation = async (finalAnswers: Record<string, any>) => {
    if (!accessToken) {
      console.error('No access token available');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Submitting employment information...');
      console.log('Has existing data:', hasExistingData);
      console.log('Final answers:', finalAnswers);

      const employmentInfoPayload = {
        employment_information: {
          company_name: finalAnswers.company_name || '',
          company_rut: finalAnswers.company_rut || '',
          charge: finalAnswers.charge || '',
          profession: finalAnswers.profession || '',
          commercial_activity: finalAnswers.commercial_activity || '',
        },
      };

      let response;
      if (hasExistingData) {
        console.log('Using PATCH to update existing data');
        response = await updateEmploymentInformation(accessToken, employmentInfoPayload);
      } else {
        console.log('Using POST to create new data');
        response = await createEmploymentInformation(accessToken, employmentInfoPayload);
      }

      if (response.success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          router.push('/(tabs)/investment/create-account/complete-profile');
        }, 2000);
      } else {
        console.error('Error submitting employment information:', response.message);
        // TODO: Show error to user
      }
    } catch (error) {
      console.error('Error submitting employment information:', error);
      // TODO: Show error to user
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (value: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: value });

    // Clear error when user starts typing
    if (errors[currentQuestion.id]) {
      const newErrors = { ...errors };
      delete newErrors[currentQuestion.id];
      setErrors(newErrors);
    }
  };

  const canContinue = () => {
    const answer = answers[currentQuestion.id];
    if (!answer || answer.trim() === '') return false;

    // Check if there's a validation error
    const error = validateCurrentAnswer(answer);
    return !error;
  };

  const handleContinue = () => {
    const answer = answers[currentQuestion.id];
    const error = validateCurrentAnswer(answer);

    if (error) {
      setErrors({ ...errors, [currentQuestion.id]: error });
      return;
    }

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      submitEmploymentInformation(answers);
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
    router.push('/(tabs)/investment/create-account/complete-profile');
  };

  const renderQuestion = () => {
    return (
      <View>
        <Input
          label={currentQuestion.text}
          placeholder={currentQuestion.placeholder || ''}
          keyboardType={currentQuestion.keyboardType || 'default'}
          value={answers[currentQuestion.id] || ''}
          onChangeText={handleInputChange}
          error={errors[currentQuestion.id]}
          disabled={isSubmitting}
        />
      </View>
    );
  };

  const isLastQuestion = currentStep === questions.length - 1;

  return (
    <FormLayout
      title="Información Laboral 💼"
      subtitle=''
      currentStep={currentStep + 1}
      totalSteps={questions.length}
      onNext={handleContinue}
      onPrevious={currentStep > 0 && !isSubmitting ? goBack : undefined}
      onCancel={currentStep === 0 ? handleCancel : undefined}
      nextButtonTitle={isSubmitting ? t('common.loading') : (isLastQuestion ? t('common.finish') : t('common.continue'))}
      previousButtonTitle={t('common.back')}
      cancelButtonTitle={t('common.cancel')}
      isNextDisabled={!canContinue() || isSubmitting}
      showLogo={false}
    >
      {renderQuestion()}

      {isSubmitting && (
        <View className="mt-4">
          <LoadingSpinner />
        </View>
      )}
      <SuccessMessage visible={showSuccess} message="Formulario actualizado correctamente" />
    </FormLayout>
  );
}
