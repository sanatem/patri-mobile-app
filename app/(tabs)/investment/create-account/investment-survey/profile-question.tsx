import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Container } from '@/components/ui/Container';
import { useTranslation } from 'react-i18next';

export default function ProfileQuestion() {
  const { t } = useTranslation();

  const questions = t('investmentSurvey.questions', { returnObjects: true }) as {
    text: string;
    options: string[];
  }[];

  const totalSteps = questions.length;
  const [step, setStep] = useState(0);

  const handleSelect = (index: number) => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      router.push('/(tabs)/investment/create-account/investment-survey/loading-profile');
    }
  };

  return (
    <Container variant="secondaryPage" style={{ padding: 20 }}>
      <View className="flex-1 p-5 justify-center bg-white">
        {/* Progreso visual */}
        <View className="flex-row mb-6">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <View
              key={index}
              className={`flex-1 h-1 mx-1 rounded ${
                index <= step ? 'bg-primary-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </View>

        <Text className="text-lg font-semibold mb-5">
          {questions[step]?.text}
        </Text>

        {/* Opciones */}
        {questions[step]?.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            className="bg-gray-100 p-3 rounded-lg mb-3"
            onPress={() => handleSelect(index)}
          >
            <Text className="text-base text-gray-800">{option}</Text>
          </TouchableOpacity>
        ))}

        {step > 0 && (
          <TouchableOpacity
            className="mt-4 items-center"
            onPress={() => setStep(step - 1)}
          >
            <Text className="text-gray-500">{t('common.back', 'Volver')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </Container>
  );
}
