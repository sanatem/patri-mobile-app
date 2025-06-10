import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Container } from '@/components/ui/Container';
import { INVESTMENT_SURVEY_QUESTIONS } from '@/constants/AppConstants';

export default function ProfileQuestion() {
  const [step, setStep] = useState(0);

  const handleSelect = (index: number) => {
    if (step < INVESTMENT_SURVEY_QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      router.push('/investment/create-account/investment-survey/loading-profile' as any);
    }
  };

  return (
    <Container variant="secondaryPage" style={{ padding: 20 }}>
      <View className="flex-1 p-5 justify-center bg-white">
        <View className="flex-row mb-6">
          {Array.from({ length: INVESTMENT_SURVEY_QUESTIONS.length }).map((_, index) => (
            <View
              key={index}
              className={`flex-1 h-1 mx-1 rounded ${
                index <= step ? 'bg-primary-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </View>

        <Text className="text-lg font-semibold mb-5">
          {INVESTMENT_SURVEY_QUESTIONS[step].text}
        </Text>

        {INVESTMENT_SURVEY_QUESTIONS[step].options.map((option, index) => (
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
            <Text className="text-gray-500">Volver</Text>
          </TouchableOpacity>
        )}
      </View>
    </Container>
  );
}
