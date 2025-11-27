import { View, Text, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { FormLayout, ImageDropbox, LoadingSpinner } from '@/components/ui';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';
import { getIdentityCard } from '@/services/investment/create-account/identity-verification/get-identity-verification';

export default function IdentityUpload() {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExistingImages();
  }, [accessToken]);

  const loadExistingImages = async () => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await getIdentityCard(accessToken);

      if (response.success && response.identity_card?.front_url) {
        setFrontImage(response.identity_card.front_url);
        await AsyncStorage.setItem('identity_front_image', response.identity_card.front_url);

        if (response.identity_card.back_url) {
          await AsyncStorage.setItem('identity_back_image', response.identity_card.back_url);
        }
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    if (frontImage) {
      try {
        if (!frontImage.startsWith('http')) {
          await AsyncStorage.setItem('identity_front_image', frontImage);
        }
        router.push('/investment/create-account/identity-step/identity-upload-back' as any);
      } catch (error) {
        Alert.alert(t('common.error'), 'Error al guardar la imagen');
      }
    }
  };

  const handleCancel = () => {
    router.push('/(tabs)/investment/create-account/complete-profile');
  };

  if (isLoading) {
    return (
      <FormLayout
        title={t('identityUpload.title')}
        subtitle=""
        currentStep={1}
        totalSteps={3}
        showLogo={false}
      >
        <View className="flex-1 justify-center items-center py-12">
          <LoadingSpinner />
          <Text className="text-base font-regular mt-4 text-center" style={{ color: Colors.gray[600] }}>
            Cargando imágenes...
          </Text>
        </View>
      </FormLayout>
    );
  }

  return (
    <FormLayout
      title={t('identityUpload.title')}
      subtitle={Platform.OS === 'web'
        ? t('identityUpload.uploadHintWeb')
        : t('identityUpload.uploadHintMobile')}
      currentStep={1}
      totalSteps={3}
      onNext={handleContinue}
      onCancel={handleCancel}
      isNextDisabled={!frontImage}
      nextButtonTitle={t('common.continue')}
      cancelButtonTitle={t('common.cancel')}
      showLogo={false}
    >
      <ImageDropbox
        image={frontImage}
        onImageChange={setFrontImage}
        placeholder={t('identityUpload.uploadPrompt')}
        aspectRatio={[16, 10]}
        quality={0.8}
        showAsDocument={true}
      />

      <View className="p-4 rounded-xl mb-6">
        <Text className="text-sm font-medium mb-2" style={{ color: Colors.primary[700] }}>
          {t('identityUpload.tips.title')}
        </Text>
        <Text className="text-sm font-regular" style={{ color: Colors.primary[500] }}>• {t('identityUpload.tips.light')}</Text>
        <Text className="text-sm font-regular" style={{ color: Colors.primary[500] }}>• {t('identityUpload.tips.legible')}</Text>
        <Text className="text-sm font-regular" style={{ color: Colors.primary[500] }}>• {t('identityUpload.tips.noGlare')}</Text>
      </View>
    </FormLayout>
  );
}
