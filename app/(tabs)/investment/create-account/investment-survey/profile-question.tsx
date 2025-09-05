import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { FormLayout, RadioButton } from '@/components/ui';
import { useTranslation } from 'react-i18next';

export default function ProfileQuestion() {
  const { t } = useTranslation();

  const questionKeys = [
    'question1', 'question2', 'question3', 'question4', 'question5',
    'question6', 'question7', 'question8', 'question9', 'question10'
  ];

  const totalSteps = questionKeys.length;
  const [step, setStep] = useState(0);
  const [selectedValue, setSelectedValue] = useState<string>('');

  const handleSelect = (value: string) => {
    setSelectedValue(value);

    setTimeout(() => {
      if (step < totalSteps - 1) {
        setStep(step + 1);
        setSelectedValue('');
      } else {
        router.push('/investment/create-account/investment-survey/loading-profile' as any);
      }
    }, 300);
  };

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1);
      setSelectedValue('');
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

  return (
    <FormLayout
      title={currentQuestion?.title}
      subtitle=""
      currentStep={step + 1}
      totalSteps={totalSteps}
      onPrevious={handlePrevious}
      previousButtonTitle={t('common.back')}
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
