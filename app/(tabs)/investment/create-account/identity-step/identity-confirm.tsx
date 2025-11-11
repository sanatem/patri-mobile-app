import { View, Text, Alert } from 'react-native';
import { router } from 'expo-router';
import { FormLayout, Input, Select, Button, LoadingSpinner, SuccessMessage } from '@/components/ui';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useIdVerification } from '@/hooks/useIdVerification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { submitOnboarding, type OnboardingRequest } from '@/services/user/onboarding';
import { useAuth } from '@/providers/AuthProvider';
import { getNationalities, getNationalityCode, getNationalityName } from '@/utils/countries';
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
    loadImages();
  }, [refreshKey]);

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

      if (front) {
        await verifyDocument(front, back || undefined);
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
    return (
      <FormLayout
        title={t('identityConfirm.title')}
        subtitle={t('identityConfirm.verificationFailed')}
        currentStep={3}
        totalSteps={3}
        onNext={() => router.push('/investment/create-account/personal-information/personal-information-question' as any)}
        onPrevious={handleRetake}
        nextButtonTitle={t('identityConfirm.continueAnyway')}
        previousButtonTitle={t('identityConfirm.retakePhoto')}
        error={error}
        showLogo={false}
      >
        <View className="bg-red-50 p-4 rounded-xl mb-6">
          <Text className="text-red-800 font-medium mb-2">
            {t('identityConfirm.verificationFailed')}
          </Text>
          <Text className="text-red-700 text-sm">{error}</Text>
        </View>
      </FormLayout>
    );
  }

  if (extractedData && verificationResult?.success) {
    const { authenticity } = verificationResult.result;
    const isHighConfidence = verificationResult.result.confidence > 0.8;
    const isAuthentic = authenticity.decision === 'accept';

    return (
      <FormLayout
        title={t('identityConfirm.title')}
        subtitle={t('identityConfirm.verificationSuccess')}
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
        <SuccessMessage visible={showSuccess} message="Formulario actualizado correctamente" />
      </FormLayout>
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

