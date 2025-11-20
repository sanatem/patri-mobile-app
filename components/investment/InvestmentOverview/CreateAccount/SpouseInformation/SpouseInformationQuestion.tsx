import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { FormLayout, Input, Select, RadioButton, LoadingSpinner, SuccessMessage } from '@/components/ui';
import CalendarSelect from '@/components/ui/CalendarSelect';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/providers/AuthProvider';
import { getSpouseInformation, createSpouseInformation, updateSpouseInformation } from '@/services/investment/create-account/spouse-information';
import { REGIONS_AND_COMMUNES } from '@/constants/AppConstants';

interface SpouseQuestion {
  id: string;
  text: string;
  type: 'input' | 'choice' | 'select' | 'date';
  placeholder?: string;
  label?: string;
  options?: Array<{
    label: string;
    value: string;
  }>;
}

export default function SpouseInformationStepper() {
  const { t } = useTranslation();
  const { accessToken } = useAuth();

  const step1Questions = t('spouseInfo.questions.step1', { returnObjects: true }) as SpouseQuestion[];
  const step2Questions = t('spouseInfo.questions.step2', { returnObjects: true }) as SpouseQuestion[];
  const nationalities = t('spouseInfo.nationalities', { returnObjects: true }) as string[];

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [spouseExists, setSpouseExists] = useState(false);

  const totalSteps = 2;

  // Filtrar preguntas del step2 basándose en same_address
  const getFilteredStep2Questions = () => {
    const addressFields = ['spouse_address', 'spouse_address_number', 'spouse_region', 'spouse_commune'];
    return step2Questions.filter((question) => {
      // Mostrar campos de dirección solo si same_address es 'no'
      if (addressFields.includes(question.id)) {
        return answers.same_address === 'no';
      }
      return true;
    });
  };

  const currentQuestions = currentStep === 0 ? step1Questions : getFilteredStep2Questions();

  // Convertir fecha de dd/mm/yyyy a yyyy-mm-dd
  const convertDateFormat = (dateStr: string): string => {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  // Convertir fecha de yyyy-mm-dd a dd/mm/yyyy para mostrar
  const convertDateForDisplay = (dateStr: string): string => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Cargar datos existentes del cónyuge
  useEffect(() => {
    const loadSpouseData = async () => {
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await getSpouseInformation(accessToken);

        if (response.success && response.spouse) {
          setSpouseExists(true);
          const spouse = response.spouse;

          // Mapear datos existentes al formulario
          setAnswers({
            first_name: spouse.first_name || '',
            paternal_last_name: spouse.father_last_name || '',
            maternal_last_name: spouse.mother_last_name || '',
            last_name: spouse.last_name || '',
            rut: spouse.rut || '',
            birth_date: spouse.birth_date ? convertDateForDisplay(spouse.birth_date) : '',
            sex: spouse.sex || '',
            email: spouse.email || '',
            nationality: spouse.nationality || '',
            phone: spouse.phone || '',
            same_address: spouse.same_address ? 'si' : 'no',
            broker_relationship_type: spouse.broker_relationship || '',
            spouse_address: spouse.address || '',
            spouse_address_number: spouse.address_number || '',
            spouse_region: spouse.region || '',
            spouse_commune: spouse.commune || '',
          });
        }
      } catch (error) {
        console.error('Error loading spouse data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSpouseData();
  }, [accessToken]);

  const submitSpouseInformation = async (finalAnswers: Record<string, any>) => {
    if (!accessToken) {
      console.error('No access token available');
      return;
    }

    setIsSubmitting(true);
    try {
      const spouseData = {
        first_name: finalAnswers.first_name || undefined,
        father_last_name: finalAnswers.paternal_last_name || undefined,
        mother_last_name: finalAnswers.maternal_last_name || undefined,
        last_name: finalAnswers.last_name || undefined,
        rut: finalAnswers.rut || undefined,
        birth_date: finalAnswers.birth_date ? convertDateFormat(finalAnswers.birth_date) : undefined,
        sex: finalAnswers.sex || undefined,
        email: finalAnswers.email || undefined,
        nationality: finalAnswers.nationality || undefined,
        phone: finalAnswers.phone || undefined,
        same_address: finalAnswers.same_address === 'si',
        broker_relationship: finalAnswers.broker_relationship_type || undefined,
        address: finalAnswers.spouse_address || undefined,
        address_number: finalAnswers.spouse_address_number || undefined,
        region: finalAnswers.spouse_region || undefined,
        commune: finalAnswers.spouse_commune || undefined,
      };

      // Usar POST si no existe, PUT si ya existe
      const response = spouseExists
        ? await updateSpouseInformation(accessToken, spouseData)
        : await createSpouseInformation(accessToken, spouseData);

      if (response.success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          router.push('/(tabs)/investment/create-account/complete-profile');
        }, 2000);
      } else {
        console.error('Error saving spouse information:', response.message);
      }
    } catch (error) {
      console.error('Error submitting spouse information:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };

    // Limpiar comuna si cambia la región
    if (questionId === 'spouse_region') {
      newAnswers.spouse_commune = '';
    }

    // Limpiar campos de dirección si cambia a "sí" en same_address
    if (questionId === 'same_address' && value === 'si') {
      newAnswers.spouse_address = '';
      newAnswers.spouse_address_number = '';
      newAnswers.spouse_region = '';
      newAnswers.spouse_commune = '';
    }

    setAnswers(newAnswers);
  };

  const handleChoiceSelect = (questionId: string, value: string) => {
    handleInputChange(questionId, value);
  };

  const canContinue = () => {
    return currentQuestions.every((question) => {
      const answer = answers[question.id];
      return answer && answer.toString().trim() !== '';
    });
  };

  const handleContinue = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      submitSpouseInformation(answers);
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

  const renderQuestion = (question: SpouseQuestion) => {
    switch (question.type) {
      case 'input':
        return (
          <View key={question.id} style={{ marginBottom: 16 }}>
            <Input
              label={question.label || question.text}
              placeholder={question.placeholder || ''}
              value={answers[question.id] || ''}
              onChangeText={(value) => handleInputChange(question.id, value)}
              keyboardType={question.id === 'phone' ? 'phone-pad' : question.id === 'email' ? 'email-address' : 'default'}
            />
          </View>
        );

      case 'date':
        return (
          <View key={question.id} style={{ marginBottom: 16 }}>
            <CalendarSelect
              label={question.label || question.text}
              value={answers[question.id] || ''}
              onSelect={(value) => handleInputChange(question.id, value)}
              placeholder={question.placeholder || 'Seleccionar fecha'}
            />
          </View>
        );

      case 'choice':
        const radioOptions = question.options?.map((option) => ({
          label: option.label,
          value: option.value,
        })) || [];

        const isHorizontal = question.id === 'sex' || question.id === 'same_address';

        const marginBottom = question.id === 'sex' || question.id === 'same_address' ? 32 : 16;

        return (
          <View key={question.id} style={{ marginBottom }}>
            <RadioButton
              label={question.label || question.text}
              options={radioOptions}
              selectedValue={answers[question.id] || ''}
              onSelect={(value) => handleChoiceSelect(question.id, value)}
              disabled={isSubmitting}
              horizontal={isHorizontal}
            />
          </View>
        );

      case 'select':
        let selectOptions: Array<{ label: string; value: string }> = [];

        if (question.id === 'nationality') {
          selectOptions = nationalities.map((nationality) => ({
            label: nationality,
            value: nationality,
          }));
        } else if (question.id === 'spouse_region') {
          selectOptions = Object.keys(REGIONS_AND_COMMUNES).map((region) => ({
            label: region,
            value: region,
          }));
        } else if (question.id === 'spouse_commune') {
          const selectedRegion = answers.spouse_region as keyof typeof REGIONS_AND_COMMUNES;
          if (selectedRegion && REGIONS_AND_COMMUNES[selectedRegion]) {
            selectOptions = REGIONS_AND_COMMUNES[selectedRegion].map((commune) => ({
              label: commune,
              value: commune,
            }));
          }
        }

        return (
          <View key={question.id} style={{ marginBottom: 16 }}>
            <Select
              label={question.label || question.text}
              options={selectOptions}
              value={answers[question.id] || ''}
              onSelect={(value) => handleInputChange(question.id, value)}
              placeholder={question.placeholder || ''}
              disabled={question.id === 'spouse_commune' && !answers.spouse_region}
            />
          </View>
        );

      default:
        return null;
    }
  };

  const isLastStep = currentStep === totalSteps - 1;

  if (isLoading) {
    return <LoadingSpinner overlay />;
  }

  return (
    <>
      <SuccessMessage visible={showSuccess} message="Datos del cónyuge guardados correctamente" />
      <FormLayout
        title={`${t('spouseInfo.title')} 💍`}
        subtitle={t('')}
        currentStep={currentStep + 1}
        totalSteps={totalSteps}
        onNext={canContinue() && !isSubmitting ? handleContinue : undefined}
        onPrevious={isSubmitting ? undefined : goBack}
        onCancel={currentStep === 0 ? handleCancel : undefined}
        nextButtonTitle={isSubmitting ? t('common.loading') : (isLastStep ? t('common.finish') : t('common.continue'))}
        cancelButtonTitle={t('common.cancel')}
        isNextDisabled={!canContinue() || isSubmitting}
        showLogo={false}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {currentQuestions.map((question) => renderQuestion(question))}
          {isSubmitting && (
            <View style={{ marginTop: 16 }}>
              <LoadingSpinner />
            </View>
          )}
        </ScrollView>
      </FormLayout>
    </>
  );
}
