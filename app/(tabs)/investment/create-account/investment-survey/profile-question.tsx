import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { router } from 'expo-router';
import { FormLayout, RadioButton } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { mapSurveyAnswersToRiskProfile } from '@/constants/RiskProfileMapping';
import { createRiskProfile } from '@/services/investment/create-account/investment-survey/create-risk-profile';
import { useAuth } from '@/providers/AuthProvider';

export default function ProfileQuestion() {
  const { t } = useTranslation();
  const { accessToken } = useAuth();

  const questionKeys = [
    'question1', 'question2', 'question3', 'question4', 'question5',
    'question6', 'question7', 'question8', 'question9', 'question10'
  ];

  const totalSteps = questionKeys.length;
  const [step, setStep] = useState(0);
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = (value: string) => {
    setSelectedValue(value);

    const currentQuestionKey = questionKeys[step];
    const updatedAnswers = { ...answers, [currentQuestionKey]: value };
    setAnswers(updatedAnswers);

    // Si no es la última pregunta, avanzar automáticamente
    if (step < totalSteps - 1) {
      setTimeout(() => {
        setStep(step + 1);
        setSelectedValue('');
      }, 300);
    }
  };

  const submitRiskProfile = async () => {
    if (!accessToken) {
      Alert.alert(t('common.error'), 'No hay token de autenticación disponible');
      return;
    }

    setIsSubmitting(true);

    try {
      const riskProfileData = mapSurveyAnswersToRiskProfile(answers);
      const response = await createRiskProfile(accessToken, riskProfileData);

      if (response.success) {
        router.push('/investment/create-account/investment-survey/profile-result' as any);
      } else {
        Alert.alert(
          t('common.error'),
          response.message || 'Error al guardar el perfil de riesgo'
        );
      }
    } catch (error) {
      console.error('Error submitting risk profile:', error);
      Alert.alert(
        t('common.error'),
        'Error al guardar el perfil de riesgo'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevious = () => {
    if (step > 0) {
      const previousStep = step - 1;
      setStep(previousStep);
      const previousQuestionKey = questionKeys[previousStep];
      setSelectedValue(answers[previousQuestionKey] || '');
    } else {
      router.back();
    }
  };

  const currentQuestionKey = questionKeys[step];
  const currentQuestion = t(`investmentSurvey.${currentQuestionKey}`, { returnObjects: true }) as {
    title: string;
    options: string[];
  };

  const radioOptions = currentQuestion?.options?.map((option, index) => ({
    label: option,
    value: index.toString()
  })) || [];

  const isLastQuestion = step === totalSteps - 1;
  const isNextButtonEnabled = isLastQuestion && selectedValue !== '';

  return (
    <FormLayout
      title={currentQuestion?.title}
      subtitle=""
      currentStep={step + 1}
      totalSteps={totalSteps}
      onPrevious={handlePrevious}
      onNext={isLastQuestion ? submitRiskProfile : undefined}
      previousButtonTitle={t('common.back')}
      nextButtonTitle={isLastQuestion ? t('common.continue') : undefined}
      isNextDisabled={!isNextButtonEnabled}
      isLoading={isSubmitting}
      loadingText={t('common.saving')}
      showLogo={false}
    >
      <View className="py-4">
        <RadioButton
          options={radioOptions}
          selectedValue={selectedValue}
          onSelect={handleSelect}
        />
      </View>
    </FormLayout>
  );
}
