import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui';
import { PERSONAL_INFORMATION_QUESTIONS, REGIONS_AND_COMMUNES } from '@/constants/AppConstants';

export default function PersonalInformationStepper() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const currentQuestion = PERSONAL_INFORMATION_QUESTIONS[currentStep];

  const handleChoiceSelect = (value: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);
    
    if (currentStep < PERSONAL_INFORMATION_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/investment/create-account/summary' as any);
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
        if ('validation' in currentQuestion && currentQuestion.validation) {
          return currentQuestion.validation(answer || '');
        }
        return !!answer;
      case 'form':
        if (!answer) return false;
        return 'fields' in currentQuestion && currentQuestion.fields?.every(field => !!answer[field.name]);
      default:
        return false;
    }
  };

  const handleContinue = () => {
    if (currentStep < PERSONAL_INFORMATION_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/investment/create-account/summary' as any);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'choice':
        return (
          <View>
            {'options' in currentQuestion && currentQuestion.options?.map((option, index) => (
              <TouchableOpacity
                key={index}
                className="bg-gray-100 p-3 rounded-lg mb-3"
                onPress={() => handleChoiceSelect(option.value)}
              >
                <Text className="text-base text-gray-800">{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'input':
        return (
          <View>
            <TextInput
              placeholder={'placeholder' in currentQuestion ? currentQuestion.placeholder : ''}
              keyboardType={'inputType' in currentQuestion ? currentQuestion.inputType : 'default'}
              value={answers[currentQuestion.id] || ''}
              onChangeText={handleInputChange}
              className="bg-gray-100 p-3 rounded-lg mb-3"
            />
            <TouchableOpacity
              className="bg-primary-500 py-3 px-8 rounded-lg"
              onPress={handleContinue}
              disabled={!canContinue()}
              style={{ opacity: canContinue() ? 1 : 0.5 }}
            >
              <Text className="text-white font-semibold text-base text-center">Continuar</Text>
            </TouchableOpacity>
          </View>
        );

      case 'form':
        const formData = answers[currentQuestion.id] || {};
        return (
          <View>
            {'fields' in currentQuestion && currentQuestion.fields?.map((field, index) => {
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
                    <Text className="font-medium mb-1">{field.name === 'region' ? 'Región' : 'Comuna'}</Text>
                    <View className="bg-gray-100 rounded-lg">
                      <Picker
                        selectedValue={formData[field.name] || ''}
                        onValueChange={(value) => handleFormChange(field.name, value)}
                        style={{ height: 50 }}
                        enabled={!('dependsOn' in field) || !field.dependsOn || !!formData[field.dependsOn]}
                      >
                        <Picker.Item label={field.placeholder} value="" />
                        {options.map((option: string) => (
                          <Picker.Item key={option} label={option} value={option} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                );
              }
              
              return null;
            })}
            
            <TouchableOpacity
              className="bg-primary-500 py-3 px-8 rounded-lg"
              onPress={handleContinue}
              disabled={!canContinue()}
              style={{ opacity: canContinue() ? 1 : 0.5 }}
            >
              <Text className="text-white font-semibold text-base text-center">Continuar</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Container variant="secondaryPage" style={{ padding: 20 }}>
      <View className="flex-1 p-5 justify-center bg-white">
        <View className="flex-row mb-6">
          {PERSONAL_INFORMATION_QUESTIONS.map((_, index) => (
            <View
              key={index}
              className={`flex-1 h-1 mx-1 rounded ${
                index <= currentStep ? 'bg-primary-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </View>

        <Text className="text-lg font-semibold mb-5">
          {currentQuestion.text}
        </Text>
        
        {'subtitle' in currentQuestion && currentQuestion.subtitle && (
          <Text className="text-sm text-gray-500 mb-5">
            {currentQuestion.subtitle}
          </Text>
        )}

        {renderQuestion()}

        {currentStep > 0 && (
          <TouchableOpacity
            className="mt-4 items-center"
            onPress={goBack}
          >
            <Text className="text-gray-500">Volver</Text>
          </TouchableOpacity>
        )}
      </View>
    </Container>
  );
} 