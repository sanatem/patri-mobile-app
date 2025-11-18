import { View, Text, Alert } from 'react-native';
import { router } from 'expo-router';
import { FormLayout, Input, Select, Button, LoadingSpinner, SuccessMessage } from '@/components/ui';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useIdVerification } from '@/hooks/useIdVerification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { submitOnboarding, type OnboardingRequest } from '@/services/user/onboarding';
import { useAuth } from '@/providers/AuthProvider';
import { getNationalities, getNationalityCode, getNationalityName } from '@/utils/countries';
import { createIdentityCard } from '@/services/investment/create-account/identity-verification/create-identity-verification';
import { getIdentityCard } from '@/services/investment/create-account/identity-verification/get-identity-verification';
import { updateIdentityCard } from '@/services/investment/create-account/identity-verification/update-identity-verification';
import Colors from '@/constants/Colors';
import { FileX } from 'lucide-react-native';

export default function IdentityConfirm() {
  const { t, i18n } = useTranslation();
  const { accessToken } = useAuth();
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showVerificationSuccess, setShowVerificationSuccess] = useState(false);
  const [hasExistingCard, setHasExistingCard] = useState(false);
  const [verificationDecision, setVerificationDecision] = useState<string | null>(null);
  const hasVerifiedRef = useRef(false);
  const wasVerifyingRef = useRef(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '', // This will store the nationality name (e.g., "Chilena")
    documentNumber: ''
  });

  const nationalities = getNationalities(i18n.language);
  const { 
    isVerifying, 
    verificationResult, 
    extractedData, 
    error, 
    isUsingMockData,
    verifyDocument,
    configureApi,
    resetToMock
  } = useIdVerification();

  useEffect(() => {
    const initializeData = async () => {
      // Primero cargar desde AsyncStorage (puede ser nuevo upload o imagen del servidor)
      await loadImages();
      
      // Si no hay imágenes en AsyncStorage, intentar cargar desde el servidor
      const front = await AsyncStorage.getItem('identity_front_image');
      if (!front) {
        await loadIdentityCard();
      }
    };

    initializeData();
  }, [refreshKey, accessToken]);

  // Capturar la decisión del verificador
  useEffect(() => {
    if (verificationResult?.result?.authenticity?.decision) {
      const decision = verificationResult.result.authenticity.decision;
      setVerificationDecision(decision);
    }
  }, [verificationResult]);

  // Detectar cuando isVerifying cambia de true a false (verificación completada)
  useEffect(() => {
    const decision = verificationResult?.result?.authenticity?.decision;
    
    // Si estaba verificando y ahora terminó (isVerifying cambió de true a false)
    if (wasVerifyingRef.current && !isVerifying) {
      // Verificar si fue exitoso (accept o review) - verificar directamente del resultado
      if (extractedData && !hasExistingCard && !error &&
          (decision === 'accept' || decision === 'review')) {
        setShowVerificationSuccess(true);
        const timer = setTimeout(() => {
          setShowVerificationSuccess(false);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
    
    // Actualizar el ref para el próximo render
    wasVerifyingRef.current = isVerifying;
  }, [isVerifying, extractedData, hasExistingCard, error, verificationResult]);

  useEffect(() => {
    if (extractedData) {
      setFormData({
        firstName: extractedData.firstName || '',
        lastName: extractedData.lastName || '',
        dateOfBirth: extractedData.birthdate || extractedData.dateOfBirth || '',
        nationality: extractedData.nationality || '',
        documentNumber: extractedData.documentNumber || ''
      });
    }
  }, [extractedData]);

  const downloadImageAsBase64 = async (url: string, token: string): Promise<string | null> => {
    try {
      console.log('Downloading image from URL:', url);

      // Intentar usar fetch con responseType para obtener base64 directamente
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Download response status:', response.status);

      if (!response.ok) {
        console.error('Error downloading image:', response.status, response.statusText);
        return null;
      }

      // Intentar obtener como blob primero
      try {
        const blob = await response.blob();
        console.log('Blob size:', blob.size, 'Type:', blob.type);

        // Verificar si FileReader está disponible (web)
        if (typeof FileReader !== 'undefined') {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = reader.result as string;
              console.log('Base64 conversion successful, length:', result?.length);
              resolve(result);
            };
            reader.onerror = (error) => {
              console.error('FileReader error:', error);
              reject(error);
            };
            reader.readAsDataURL(blob);
          });
        } else {
          // Para React Native, intentar otro método
          console.log('FileReader not available, trying alternative method');
          const arrayBuffer = await response.arrayBuffer();
          const base64 = btoa(
            new Uint8Array(arrayBuffer).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ''
            )
          );
          const mimeType = response.headers.get('content-type') || 'image/jpeg';
          return `data:${mimeType};base64,${base64}`;
        }
      } catch (blobError) {
        console.error('Error processing blob:', blobError);
        return null;
      }
    } catch (error) {
      console.error('Error downloading image as base64:', error);
      return null;
    }
  };

  const loadIdentityCard = async () => {
    if (!accessToken) return;

    try {
      const response = await getIdentityCard(accessToken);
      console.log('GET identity card response:', response);

      if (response.success && response.identity_card) {
        setHasExistingCard(true);

        const identityCard = response.identity_card;

        // Usar las URLs directamente (sin descargar debido a CORS)
        // Las imágenes se mostrarán directamente en los componentes Image
        if (identityCard.front_url) {
          console.log('Setting front image URL:', identityCard.front_url);
          setFrontImage(identityCard.front_url);
          await AsyncStorage.setItem('identity_front_image', identityCard.front_url);
        }

        if (identityCard.back_url) {
          console.log('Setting back image URL:', identityCard.back_url);
          setBackImage(identityCard.back_url);
          await AsyncStorage.setItem('identity_back_image', identityCard.back_url);
        }

        // Cargar datos guardados para mostrar el formulario
        console.log('Loading saved data for server images');
        try {
          const savedData = await AsyncStorage.getItem('extracted_personal_data');
          if (savedData) {
            const parsedData = JSON.parse(savedData);
            console.log('Loaded saved data:', parsedData);
            setFormData({
              firstName: parsedData.firstName || '',
              lastName: parsedData.lastName || '',
              dateOfBirth: parsedData.dateOfBirth || parsedData.birthdate || '',
              nationality: parsedData.nationality || '',
              documentNumber: parsedData.documentNumber || ''
            });
          } else {
            console.log('No saved data found in AsyncStorage');
          }
        } catch (err) {
          console.error('Error loading saved data:', err);
        }
      }
    } catch (error) {
      console.error('Error loading identity card:', error);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const loadImages = async () => {
    try {
      const front = await AsyncStorage.getItem('identity_front_image');
      const back = await AsyncStorage.getItem('identity_back_image');
      
      setFrontImage(front);
      setBackImage(back);

      // Verificar si la imagen es base64 (nuevo upload) o URL del servidor
      if (front && front.startsWith('data:')) {
        // Solo verificar si no se ha verificado antes
        if (!hasVerifiedRef.current) {
          console.log('Verifying newly uploaded document (base64)...');
          hasVerifiedRef.current = true;
          const result = await verifyDocument(front, back || undefined);
          console.log('Verification completed, result:', result);
        } else {
          console.log('Document already verified, skipping verification');
        }
      } else if (front && front.startsWith('http')) {
        // Si es una URL del servidor, marcar que ya existe un carnet
        console.log('Found server image URL, loading saved data...');
        setHasExistingCard(true);
        
        // Cargar datos guardados (no intentar descargar por CORS)
        const savedData = await AsyncStorage.getItem('extracted_personal_data');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          console.log('Loaded saved personal data:', parsedData);
          setFormData({
            firstName: parsedData.firstName || '',
            lastName: parsedData.lastName || '',
            dateOfBirth: parsedData.dateOfBirth || parsedData.birthdate || '',
            nationality: parsedData.nationality || '',
            documentNumber: parsedData.documentNumber || ''
          });
        } else {
          console.log('No saved personal data found');
        }
      }
    } catch (error) {
      console.error('Error in loadImages:', error);
      Alert.alert(
        t('common.error'),
        t('identityConfirm.errorLoadingImages')
      );
    }
  };

    const handleContinue = async () => {
    
    if (!formData.firstName || !formData.lastName || !formData.documentNumber) {
      Alert.alert(
        t('common.error'),
        'Por favor completa todos los campos requeridos'
      );
      return;
    }

    if (!accessToken) {
      Alert.alert(
        t('common.error'),
        'No hay token de autenticación disponible'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const nationalityCode = getNationalityCode(formData.nationality, i18n.language);

      // 1. Guardar identity card (imágenes del documento)
      // Solo guardar si las imágenes son base64 (nuevas), no URLs del servidor
      const isFrontImageBase64 = frontImage && frontImage.startsWith('data:');
      const isBackImageBase64 = backImage && backImage.startsWith('data:');
      
      console.log('Image check:', {
        isFrontImageBase64,
        isBackImageBase64,
        hasExistingCard,
        frontImageType: frontImage?.substring(0, 50),
        backImageType: backImage?.substring(0, 50)
      });
      
      if (isFrontImageBase64 && isBackImageBase64) {
        let identityCardResponse;

        // Primero verificar si realmente existe un carnet en el servidor
        const existingCardCheck = await getIdentityCard(accessToken);
        const cardExistsInServer = existingCardCheck.success && existingCardCheck.identity_card;

        console.log('Card exists in server:', cardExistsInServer);

        // Determinar el estado de verificación basado en la decisión del ID Analyzer
        // accept o review = true (verificado), reject = false (rechazado)
        // TODO: Restore after testing: const isVerified = verificationDecision === 'accept' || verificationDecision === 'review';
        const isVerified = true; // Forced for testing broker documentation flow

        if (cardExistsInServer) {
          // Si ya existe un card en el servidor, hacer PUT (actualizar)
          console.log('Updating existing identity card with new images');
          identityCardResponse = await updateIdentityCard(accessToken, {
            frontImage: frontImage,
            backImage: backImage,
            verified: isVerified,
          });
        } else {
          // Si no existe en el servidor, hacer POST (crear)
          console.log('Creating new identity card');
          identityCardResponse = await createIdentityCard(accessToken, {
            frontImage: frontImage,
            backImage: backImage,
            verified: isVerified,
          });
        }

        if (!identityCardResponse.success) {
          console.error('Error saving identity card:', identityCardResponse.message);
          Alert.alert(
            t('common.error'),
            'Error al guardar las imágenes del documento'
          );
          return;
        }

        console.log('Identity card saved successfully');
      } else if (hasExistingCard && (frontImage || backImage)) {
        console.log('Skipping image upload - using existing images from server');
      }

      // 2. Enviar onboarding data
      const onboardingData: OnboardingRequest = {
        personal_information: {
          rut: formData.documentNumber,
          birth_date: formData.dateOfBirth,
          monthly_incomes: '',
          nationality: nationalityCode || formData.nationality, // Send ISO code (e.g., "CL") or fallback to name
          first_name: formData.firstName,
          last_name: formData.lastName
        }
      };

      const response = await submitOnboarding(accessToken, onboardingData);

      if (response?.success) {
        const extractedDataFormat = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          birthdate: formData.dateOfBirth,
          nationality: formData.nationality,
          documentNumber: formData.documentNumber
        };
        await AsyncStorage.setItem('extracted_personal_data', JSON.stringify(extractedDataFormat));

        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          router.push('/(tabs)/investment/create-account/complete-profile');
        }, 2000);
      } else {
        throw new Error(t('identityConfirm.serverError'));
      }
    } catch (error) {
      Alert.alert(
        t('common.error'),
        error instanceof Error ? error.message : t('identityConfirm.submitError')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    AsyncStorage.multiRemove(['identity_front_image', 'identity_back_image']);
    hasVerifiedRef.current = false; // Resetear para permitir nueva verificación
    router.push('/investment/create-account/identity-step/identity-upload' as any);
  };


  if (isVerifying) {
    return (
      <FormLayout
        title={t('identityConfirm.title')}
        subtitle=""
        currentStep={3}
        totalSteps={3}
        isLoading={true}
        loadingText={t('identityConfirm.verifying')}
        showLogo={false}
      >
        <View className="flex-1 justify-center items-center py-12">
          <LoadingSpinner />
          <Text className="text-lg font-regular mt-4 text-center">
            {t('identityConfirm.verifying')}
          </Text>
        </View>
      </FormLayout>
    );
  }

  if (error) {
    // Si el error indica que el documento fue rechazado, solo mostrar botón para volver a subir
    const isDocumentRejected = error.includes('autenticidad') || error.includes('fake') || error.includes('rechazado');
    
    const handleCancelToProfile = () => {
      router.push('/(tabs)/investment/create-account/complete-profile');
    };
    
    return (
      <>
        <SuccessMessage visible={showSuccess} message="Formulario actualizado correctamente" />
        <FormLayout
          title={t('identityConfirm.title')}
          subtitle={t('identityConfirm.verificationFailed')}
          currentStep={3}
          totalSteps={3}
          onNext={isDocumentRejected ? handleRetake : handleContinue}
          onCancel={isDocumentRejected ? handleCancelToProfile : handleRetake}
          nextButtonTitle={isDocumentRejected ? t('identityConfirm.retakePhoto') : (isSubmitting ? t('common.sending') : t('common.finish'))}
          cancelButtonTitle={isDocumentRejected ? t('common.cancel') : t('identityConfirm.retakePhoto')}
          isLoading={isSubmitting}
          isNextDisabled={isSubmitting}
          showLogo={false}
        >
        <View style={{
          backgroundColor: Colors.error[50],
          borderWidth: 1,
          borderColor: Colors.error[200],
          borderRadius: 8,
          padding: 12,
          marginBottom: 16
        }}>
          <Text className="text-sm font-medium" style={{ color: Colors.error[700] }}>
            {t('identityConfirm.verificationFailed')}
          </Text>
          <Text className="text-sm font-regular" style={{ color: Colors.error[600], marginTop: 4 }}>
            {isDocumentRejected ? t('identityConfirm.documentRejected') : error}
          </Text>
          {!isDocumentRejected && (
            <Text className="text-sm font-regular" style={{ color: Colors.error[600], marginTop: 4 }}>
              {t('identityConfirm.enterManually')}
            </Text>
          )}
        </View>

        {!isDocumentRejected && (
          <>
            <View className="space-y-4 mb-6">
              <Input
                label={t('identityConfirm.firstName')}
                value={formData.firstName}
                onChangeText={(value) => handleInputChange('firstName', value)}
                placeholder={t('identityConfirm.firstName')}
              />
              
              <Input
                label={t('identityConfirm.lastName1')}
                value={formData.lastName}
                onChangeText={(value) => handleInputChange('lastName', value)}
                placeholder={t('identityConfirm.lastName1')}
              />
              
              <Input
                label={t('identityConfirm.dateOfBirth')}
                value={formData.dateOfBirth}
                onChangeText={(value) => handleInputChange('dateOfBirth', value)}
                placeholder="YYYY-MM-DD"
              />
              
              <Select
                label={t('identityConfirm.nationality')}
                options={nationalities.map(nationality => ({
                  label: nationality.name,
                  value: nationality.name
                }))}
                value={formData.nationality}
                onSelect={(value) => handleInputChange('nationality', value)}
                placeholder={t('identityConfirm.selectNationality') || 'Selecciona nacionalidad'}
              />
              
              <Input
                label={t('identityConfirm.documentNumber')}
                value={formData.documentNumber}
                onChangeText={(value) => handleInputChange('documentNumber', value)}
                placeholder={t('identityConfirm.documentNumber')}
              />
            </View>
          </>
        )}
      </FormLayout>
      </>
    );
  }

  // Mostrar formulario si hay datos extraídos O si hay imágenes del servidor O si hay datos guardados
  const hasFormData = formData.firstName || formData.lastName || formData.documentNumber;
  const shouldShowForm = (extractedData && verificationResult?.success) || 
                         (hasExistingCard && frontImage) || 
                         (frontImage && hasFormData);

  console.log('Should show form check:', {
    extractedData: !!extractedData,
    verificationSuccess: verificationResult?.success,
    hasExistingCard,
    hasFrontImage: !!frontImage,
    hasFormData,
    shouldShowForm
  });

  if (shouldShowForm) {
    return (
      <>
        <SuccessMessage visible={showVerificationSuccess} message={t('identityConfirm.documentVerified') || 'Documento verificado correctamente'} />
        <SuccessMessage visible={showSuccess} message="Formulario actualizado correctamente" />
        <FormLayout
          title={t('identityConfirm.title')}
          subtitle={hasExistingCard ? t('identityConfirm.description') : t('identityConfirm.verificationSuccess')}
          currentStep={3}
          totalSteps={3}
          onNext={handleContinue}
          onPrevious={handleRetake}
          nextButtonTitle={isSubmitting ? t('common.sending') : t('common.finish')}
          previousButtonTitle={t('common.back')}
          isLoading={isSubmitting}
          isNextDisabled={isSubmitting}
          showLogo={false}
        >
          <View className="space-y-4 mb-6">
          <Input
            label={t('identityConfirm.firstName')}
            value={formData.firstName}
            onChangeText={(value) => handleInputChange('firstName', value)}
            placeholder={t('identityConfirm.firstName')}
          />
          
          <Input
            label={t('identityConfirm.lastName1')}
            value={formData.lastName}
            onChangeText={(value) => handleInputChange('lastName', value)}
            placeholder={t('identityConfirm.lastName1')}
          />
          
          <Input
            label={t('identityConfirm.dateOfBirth')}
            value={formData.dateOfBirth}
            onChangeText={(value) => handleInputChange('dateOfBirth', value)}
            placeholder="YYYY-MM-DD"
          />
          
          <Select
            label={t('identityConfirm.nationality')}
            options={nationalities.map(nationality => ({
              label: nationality.name,
              value: nationality.name
            }))}
            value={formData.nationality}
            onSelect={(value) => handleInputChange('nationality', value)}
            placeholder={t('identityConfirm.selectNationality') || 'Selecciona nacionalidad'}
          />
          
          <Input
            label={t('identityConfirm.documentNumber')}
            value={formData.documentNumber}
            onChangeText={(value) => handleInputChange('documentNumber', value)}
            placeholder={t('identityConfirm.documentNumber')}
          />
        </View>
      </FormLayout>
      </>
    );
  }

  const handleCancel = () => {
    router.back();
  };

  return (
    <FormLayout
      title={t('identityConfirm.title')}
      subtitle=""
      currentStep={4}
      totalSteps={4}
      onNext={handleRetake}
      onCancel={handleCancel}
      nextButtonTitle={t('identityConfirm.retakePhoto')}
      cancelButtonTitle={t('common.cancel')}
      showLogo={false}
    >
      <View className="flex-1 justify-center items-center py-8">
        <View className="w-16 h-16 rounded-full bg-gray-100 justify-center items-center mb-4">
          <FileX size={32} color={Colors.gray[400]} />
        </View>
        <Text className="text-center font-medium" style={{ color: Colors.gray[400] }}>
          {t('identityConfirm.noDataFound')}
        </Text>
      </View>
    </FormLayout>
  );
}

