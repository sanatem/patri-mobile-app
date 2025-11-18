import React, { useState, useEffect } from 'react';
import { View, Alert, Text } from 'react-native';
import { router } from 'expo-router';
import { FormLayout, RadioButton, SuccessMessage } from '@/components/ui';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { mapSurveyAnswersToRiskProfile } from '@/constants/RiskProfileMapping';
import { createRiskProfile } from '@/services/investment/create-account/investment-survey/create-risk-profile';
import { updateRiskProfile } from '@/services/investment/create-account/investment-survey/update-risk-profile';
import { getRiskProfile } from '@/services/investment/create-account/investment-survey/get-risk-profile';
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
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    checkExistingProfile();
  }, [accessToken]);

  const checkExistingProfile = async () => {
    if (!accessToken) return;

    try {
      const response = await getRiskProfile(accessToken);
      console.log('=== CHECK EXISTING PROFILE ===');
      console.log('Full response:', JSON.stringify(response, null, 2));
      console.log('response.success:', response.success);
      console.log('response.risk_profile:', response.risk_profile);
      console.log('response.investor_questionnaire:', response.investor_questionnaire);
      
      // investor_category está en investor_questionnaire, no en risk_profile
      const investorCategory = response.investor_questionnaire?.investor_category;
      console.log('investor_category:', investorCategory);
      console.log('investor_category type:', typeof investorCategory);
      console.log('investor_category is null?', investorCategory === null);
      console.log('investor_category is undefined?', investorCategory === undefined);
      
      // Si investor_category está poblado (no es null ni undefined), usar PATCH
      // Si investor_category es null o undefined, usar POST
      const hasCategory = investorCategory !== null && 
                         investorCategory !== undefined &&
                         investorCategory !== '';
      
      if (response.success && response.risk_profile && hasCategory) {
        console.log('✅ investor_category is populated - will use PATCH');
        setHasExistingProfile(true);
      } else {
        console.log('❌ investor_category is null/undefined/empty - will use POST');
        setHasExistingProfile(false);
      }
      console.log('=== END CHECK ===');
    } catch (error) {
      console.error('Error checking existing profile:', error);
      setHasExistingProfile(false);
    }
  };

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
      
      console.log('Submitting risk profile...');
      console.log('hasExistingProfile:', hasExistingProfile);
      console.log('Will use:', hasExistingProfile ? 'PATCH (update)' : 'POST (create)');
      
      // Usar PATCH si ya existe un perfil, POST si es nuevo
      const response = hasExistingProfile
        ? await updateRiskProfile(accessToken, riskProfileData)
        : await createRiskProfile(accessToken, riskProfileData);

      console.log('Response:', response);

      if (response.success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          router.push('/(tabs)/investment/create-account/investment-survey/profile-result');
        }, 2000);
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

  const handleCancel = () => {
    router.push('/(tabs)/investment/create-account/complete-profile');
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
    <>
      <SuccessMessage visible={showSuccess} message="Formulario actualizado correctamente" />
      <FormLayout
        title="Perfil de Riesgo 📊"
        subtitle=""
        currentStep={step + 1}
        totalSteps={totalSteps}
        onPrevious={handlePrevious}
        onNext={isLastQuestion ? submitRiskProfile : undefined}
        onCancel={step === 0 ? handleCancel : undefined}
        previousButtonTitle={t('common.back')}
        nextButtonTitle={isLastQuestion ? t('common.continue') : undefined}
        cancelButtonTitle={t('common.cancel')}
        isNextDisabled={!isNextButtonEnabled}
        isLoading={isSubmitting}
        loadingText={t('common.saving')}
        showLogo={false}
      >
        <View className="py-4">
          <Text className="text-base font-medium mb-6" style={{ color: Colors.primary[700] }}>
            {currentQuestion?.title}
          </Text>
          <RadioButton
            options={radioOptions}
            selectedValue={selectedValue}
            onSelect={handleSelect}
          />
        </View>
      </FormLayout>
    </>
  );
}
