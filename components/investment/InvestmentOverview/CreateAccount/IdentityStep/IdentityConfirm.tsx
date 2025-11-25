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
    nationality: '',
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
      await loadImages();

      const front = await AsyncStorage.getItem('identity_front_image');
      if (!front) {
        await loadIdentityCard();
      }
    };

    initializeData();
  }, [refreshKey, accessToken]);

  useEffect(() => {
    if (verificationResult?.result?.authenticity?.decision) {
      const decision = verificationResult.result.authenticity.decision;
      setVerificationDecision(decision);
    }
  }, [verificationResult]);

  useEffect(() => {
    const decision = verificationResult?.result?.authenticity?.decision;

    if (wasVerifyingRef.current && !isVerifying) {
      if (extractedData && !hasExistingCard && !error &&
          (decision === 'accept' || decision === 'review')) {
        setShowVerificationSuccess(true);
        const timer = setTimeout(() => {
          setShowVerificationSuccess(false);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }

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
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      try {
        const blob = await response.blob();

        if (typeof FileReader !== 'undefined') {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = reader.result as string;
              resolve(result);
            };
            reader.onerror = (error) => {
              reject(error);
            };
            reader.readAsDataURL(blob);
          });
        } else {
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
        return null;
      }
    } catch (error) {
      return null;
    }
  };

  const loadIdentityCard = async () => {
    if (!accessToken) return;

    try {
      const response = await getIdentityCard(accessToken);

      if (response.success && response.identity_card) {
        setHasExistingCard(true);

        const identityCard = response.identity_card;

        if (identityCard.front_url) {
          setFrontImage(identityCard.front_url);
          await AsyncStorage.setItem('identity_front_image', identityCard.front_url);
        }

        if (identityCard.back_url) {
          setBackImage(identityCard.back_url);
          await AsyncStorage.setItem('identity_back_image', identityCard.back_url);
        }

        try {
          const savedData = await AsyncStorage.getItem('extracted_personal_data');
          if (savedData) {
            const parsedData = JSON.parse(savedData);
            setFormData({
              firstName: parsedData.firstName || '',
              lastName: parsedData.lastName || '',
              dateOfBirth: parsedData.dateOfBirth || parsedData.birthdate || '',
              nationality: parsedData.nationality || '',
              documentNumber: parsedData.documentNumber || ''
            });
          }
        } catch (err) {
          // Error loading saved data
        }
      }
    } catch (error) {
      // Error loading identity card
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

      if (front && front.startsWith('data:')) {
        if (!hasVerifiedRef.current) {
          hasVerifiedRef.current = true;
          await verifyDocument(front, back || undefined);
        }
      } else if (front && front.startsWith('http')) {
        setHasExistingCard(true);

        const savedData = await AsyncStorage.getItem('extracted_personal_data');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setFormData({
            firstName: parsedData.firstName || '',
            lastName: parsedData.lastName || '',
            dateOfBirth: parsedData.dateOfBirth || parsedData.birthdate || '',
            nationality: parsedData.nationality || '',
            documentNumber: parsedData.documentNumber || ''
          });
        }
      }
    } catch (error) {
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

      const isFrontImageBase64 = frontImage && frontImage.startsWith('data:');
      const isBackImageBase64 = backImage && backImage.startsWith('data:');

      if (isFrontImageBase64 && isBackImageBase64) {
        let identityCardResponse;

        const existingCardCheck = await getIdentityCard(accessToken);
        const cardExistsInServer = existingCardCheck.success && existingCardCheck.identity_card;

        const isVerified = true;

        if (cardExistsInServer) {
          identityCardResponse = await updateIdentityCard(accessToken, {
            frontImage: frontImage,
            backImage: backImage,
            verified: isVerified,
          });
        } else {
          identityCardResponse = await createIdentityCard(accessToken, {
            frontImage: frontImage,
            backImage: backImage,
            verified: isVerified,
          });
        }

        if (!identityCardResponse.success) {
          Alert.alert(
            t('common.error'),
            'Error al guardar las imágenes del documento'
          );
          return;
        }
      }

      const onboardingData: OnboardingRequest = {
        personal_information: {
          rut: formData.documentNumber,
          birth_date: formData.dateOfBirth,
          monthly_incomes: '',
          nationality: nationalityCode || formData.nationality,
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
          router.push('/(tabs)/investment/create-account/personal-information/personal-information-question');
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
    hasVerifiedRef.current = false;
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

  const hasFormData = formData.firstName || formData.lastName || formData.documentNumber;
  const shouldShowForm = (extractedData && verificationResult?.success) ||
                         (hasExistingCard && frontImage) ||
                         (frontImage && hasFormData);

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
