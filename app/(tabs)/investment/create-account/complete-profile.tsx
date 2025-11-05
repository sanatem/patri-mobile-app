import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { FormLayout } from '@/components/ui';
import { useTranslation } from 'react-i18next';

export default function CompleteProfile() {
  const { t } = useTranslation();
  
  const handleNext = () => {
    router.push("/investment/create-account/identity-step/identity-upload" as any);
  };

  return (
    <FormLayout
      title={t('completeProfile.title')}
      subtitle={t('completeProfile.subtitle')}
      currentStep={8}
      totalSteps={8}
      onNext={handleNext}
      nextButtonTitle={t('completeProfile.getStarted')}
    >
      <View className="space-y-4">
        <TouchableOpacity
          className="bg-primary-500 p-4 rounded-xl"
          onPress={handleNext}
        >
          <Text className="text-white font-semibold text-base">
            {t('completeProfile.steps.identity.title')}
          </Text>
          <Text className="text-white mt-1 font-regular">
            {t('completeProfile.steps.identity.description')}
          </Text>
        </TouchableOpacity>

        <View className="bg-gray-100 p-4 rounded-xl mt-4">
          <Text className="text-gray-400 font-semibold text-base">
            {t('completeProfile.steps.basic.title')}
          </Text>
          <Text className="text-gray-400 mt-1 font-regular">
            {t('completeProfile.steps.basic.description')}
          </Text>
        </View>

        <View className="bg-gray-100 p-4 rounded-xl mt-4">
          <Text className="text-gray-400 font-semibold text-base">
            {t('completeProfile.steps.contract.title')}
          </Text>
          <Text className="text-gray-400 mt-1 font-regular">
            {t('completeProfile.steps.contract.description')}
          </Text>
        </View>

        <View className="bg-gray-100 p-4 rounded-xl mt-4">
          <Text className="text-gray-400 font-semibold text-base">
            {t('completeProfile.steps.start.title')}
          </Text>
          <Text className="text-gray-400 mt-1 font-regular">
            {t('completeProfile.steps.start.description')}
          </Text>
        </View>
      </View>
    </FormLayout>
  );
}