import { View, Text, Alert } from 'react-native';
import { router } from 'expo-router';
import { FormLayout, ImageDropbox, LoadingSpinner } from '@/components/ui';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';
import { createIdentityCard } from '@/services/investment/create-account/identity-verification/create-identity-verification';
import { updateIdentityCard } from '@/services/investment/create-account/identity-verification/update-identity-verification';
import { getIdentityCard } from '@/services/investment/create-account/identity-verification/get-identity-verification';
import { verifyIdentityCard, extractPersonalDataFromResponse } from '@/services/investment/create-account/identity-verification/verify-identity-card';

export default function IdentityUploadBack() {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const [backImage, setBackImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');

  useEffect(() => {
    loadExistingBackImage();
  }, []);

  const loadExistingBackImage = async () => {
    try {
      const savedBackImage = await AsyncStorage.getItem('identity_back_image');
      if (savedBackImage) {
        setBackImage(savedBackImage);
      }
    } catch (error) {
      // Error loading existing back image
    }
  };

  const handleContinue = async () => {
    if (!backImage || !accessToken) return;

    setIsProcessing(true);

    try {
      // Guardar imagen en AsyncStorage
      if (!backImage.startsWith('http')) {
        await AsyncStorage.setItem('identity_back_image', backImage);
      }

      // Obtener imagen frontal
      const frontImage = await AsyncStorage.getItem('identity_front_image');
      if (!frontImage) {
        Alert.alert(t('common.error'), 'No se encontró la imagen frontal del documento');
        return;
      }

      // Verificar si hay imágenes nuevas para subir (no son URLs del servidor)
      const hasFrontToUpload = !frontImage.startsWith('http');
      const hasBackToUpload = !backImage.startsWith('http');

      // Si ambas son URLs del servidor, solo navegar a verificación
      if (!hasFrontToUpload && !hasBackToUpload) {
        // Las imágenes ya están en el servidor, continuar con la verificación
        setProcessingMessage('Verificando documento...');
      } else {
        // Hay al menos una imagen nueva para subir
        setProcessingMessage('Guardando imágenes...');

        // Para subir, necesitamos ambas imágenes nuevas (no URLs HTTP)
        if (!hasFrontToUpload || !hasBackToUpload) {
          Alert.alert(
            t('common.error'), 
            'Por favor, vuelve a tomar ambas fotos del documento.'
          );
          return;
        }

        // Verificar si ya existe una tarjeta en el servidor
        const existingCardCheck = await getIdentityCard(accessToken);
        const cardExists = existingCardCheck.success && existingCardCheck.identity_card;

        let saveResponse;
        if (cardExists) {
          // Si ya existe, usar PUT
          saveResponse = await updateIdentityCard(accessToken, {
            frontImage: frontImage,
            backImage: backImage,
          });
        } else {
          // Si no existe, usar POST
          saveResponse = await createIdentityCard(accessToken, {
            frontImage: frontImage,
            backImage: backImage,
          });
        }

        if (!saveResponse.success) {
          Alert.alert(
            t('common.error'), 
            saveResponse.message || 'Error al guardar el documento'
          );
          return;
        }
      }

      // 2. Verificar el documento
      setProcessingMessage('Verificando documento...');

      const verifyResponse = await verifyIdentityCard(accessToken);

      if (verifyResponse.success && verifyResponse.data) {
        // 3. Extraer y guardar datos personales
        const personalData = extractPersonalDataFromResponse(verifyResponse);

        if (personalData) {
          await AsyncStorage.setItem('extracted_personal_data', JSON.stringify(personalData));
        }

        // Guardar resultado de verificación para IdentityConfirm
        await AsyncStorage.setItem('verification_result', JSON.stringify(verifyResponse));

        // Si la verificación del documento falló, guardar error
        if (!verifyResponse.data.verification.verified) {
          await AsyncStorage.setItem('verification_error', 'El documento no pasó la verificación. Por favor ingresa los datos manualmente.');
        }
      } else {
        // Si falla la llamada al endpoint, guardar el error
        await AsyncStorage.setItem('verification_error', verifyResponse.message || 'Error al verificar el documento');
      }

      // 4. Navegar a IdentityConfirm
      router.push('/investment/create-account/identity-step/identity-confirm' as any);

    } catch (error) {
      Alert.alert(t('common.error'), 'Error al procesar el documento');
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  if (isProcessing) {
    return (
      <FormLayout
        title={t('identityUploadBack.title')}
        subtitle=""
        currentStep={2}
        totalSteps={3}
        showLogo={false}
      >
        <View className="flex-1 justify-center items-center py-12">
          <LoadingSpinner />
          <Text className="text-base font-regular mt-4 text-center" style={{ color: Colors.gray[600] }}>
            {processingMessage || 'Procesando...'}
          </Text>
        </View>
      </FormLayout>
    );
  }

  return (
    <FormLayout
      title={t('identityUploadBack.title')}
      subtitle={t('identityUploadBack.uploadSubtitle')}
      currentStep={2}
      totalSteps={3}
      onNext={handleContinue}
      onPrevious={handleGoBack}
      isNextDisabled={!backImage}
      nextButtonTitle={t('common.continue')}
      previousButtonTitle={t('common.back')}
      showLogo={false}
    >
      <ImageDropbox
        image={backImage}
        onImageChange={setBackImage}
        placeholder={t('identityUploadBack.uploadPrompt')}
        aspectRatio={[16, 10]}
        quality={0.8}
        showAsDocument={true}
      />

      <View className="p-4 rounded-xl mb-6">
        <Text className="text-sm font-medium mb-2" style={{ color: Colors.primary[700] }}>
          {t('identityUploadBack.tips.title')}
        </Text>
        <Text className="text-sm font-regular" style={{ color: Colors.primary[500] }}>• {t('identityUploadBack.tips.light')}</Text>
        <Text className="text-sm font-regular" style={{ color: Colors.primary[500] }}>• {t('identityUploadBack.tips.legible')}</Text>
        <Text className="text-sm font-regular" style={{ color: Colors.primary[500] }}>• {t('identityUploadBack.tips.noGlare')}</Text>
      </View>
    </FormLayout>
  );
}
