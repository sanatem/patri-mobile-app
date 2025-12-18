import { View, Text, Alert } from 'react-native';
import { router } from 'expo-router';
import { FormLayout, Input, Select, SuccessMessage } from '@/components/ui';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { submitOnboarding, type OnboardingRequest } from '@/services/user/onboarding';
import { getPersonalInformation } from '@/services/investment/create-account/personal-information/get-personal-information';
import { useAuth } from '@/providers/AuthProvider';
import { getNationalities, getNationalityCode } from '@/utils/countries';
import Colors from '@/constants/Colors';
import { FileX } from 'lucide-react-native';
import type { VerifyIdentityCardResponse } from '@/services/investment/create-account/identity-verification/verify-identity-card';

export default function IdentityConfirm() {
  const { t, i18n } = useTranslation();
  const { accessToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerifyIdentityCardResponse | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    documentNumber: '',
    rut: ''
  });
  const [isRutLocked, setIsRutLocked] = useState(false);

  const nationalities = getNationalities(i18n.language || 'es');

  useEffect(() => {
    loadVerificationData();
  }, []);

  const loadVerificationData = async () => {
    try {
      // Cargar error de verificación si existe
      const verificationError = await AsyncStorage.getItem('verification_error');
      if (verificationError) {
        setError(verificationError);
        await AsyncStorage.removeItem('verification_error');
      }

      // Cargar resultado de verificación
      const resultStr = await AsyncStorage.getItem('verification_result');
      if (resultStr) {
        const result = JSON.parse(resultStr) as VerifyIdentityCardResponse;
        setVerificationResult(result);

        if (result.data?.verification && !result.data.verification.verified) {
          setError('El documento no pasó la verificación. Por favor ingresa los datos manualmente.');
        }
      }

      // Cargar datos extraídos
      const savedData = await AsyncStorage.getItem('extracted_personal_data');
      let extractedRut = '';

      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setFormData({
          firstName: parsedData.firstName || '',
          lastName: parsedData.lastName || '',
          dateOfBirth: parsedData.dateOfBirth || parsedData.birthdate || '',
          nationality: parsedData.nationality || '',
          documentNumber: parsedData.documentNumber || '',
          rut: parsedData.rut || ''
        });
      }

      // Cargar RUT desde personal_information si existe
      if (accessToken) {
        const personalInfoResponse = await getPersonalInformation(accessToken);
        if (personalInfoResponse.success && personalInfoResponse.personal_information?.rut) {
          extractedRut = personalInfoResponse.personal_information.rut;
          setFormData(prev => ({
            ...prev,
            rut: extractedRut
          }));
          setIsRutLocked(true);
        }
      }
    } catch (err) {
      // Error loading verification data
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormComplete = formData.firstName && formData.lastName && formData.dateOfBirth && formData.nationality && formData.rut;

  const handleContinue = async () => {
    if (!isFormComplete) {
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
      const nationalityCode = getNationalityCode(formData.nationality, i18n.language || 'es');

      const onboardingData: OnboardingRequest = {
        personal_information: {
          rut: formData.rut,
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
          documentNumber: formData.documentNumber,
          rut: formData.rut
        };
        await AsyncStorage.setItem('extracted_personal_data', JSON.stringify(extractedDataFormat));

        // Limpiar datos de verificación
        await AsyncStorage.removeItem('verification_result');

        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          router.push('/(tabs)/investment/create-account/personal-information/personal-information-question');
        }, 2000);
      } else {
        throw new Error(t('identityConfirm.serverError'));
      }
    } catch (err) {
      Alert.alert(
        t('common.error'),
        err instanceof Error ? err.message : t('identityConfirm.submitError')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = async () => {
    await AsyncStorage.multiRemove([
      'identity_front_image',
      'identity_back_image',
      'verification_result',
      'verification_error',
      'extracted_personal_data'
    ]);
    router.push('/investment/create-account/identity-step/identity-upload' as any);
  };

  const handleCancel = () => {
    router.push('/(tabs)/investment/create-account/complete-profile');
  };

  if (error) {
    const isDocumentRejected = error.includes('autenticidad') || error.includes('fake') || error.includes('rechazado');

    return (
      <>
        <SuccessMessage visible={showSuccess} message="Formulario actualizado correctamente" />
        <FormLayout
          title={t('identityConfirm.title')}
          subtitle={t('identityConfirm.verificationFailed')}
          currentStep={3}
          totalSteps={3}
          onNext={isDocumentRejected ? handleRetake : handleContinue}
          onCancel={handleCancel}
          nextButtonTitle={isDocumentRejected ? t('identityConfirm.retakePhoto') : (isSubmitting ? t('common.sending') : t('common.finish'))}
          cancelButtonTitle={t('common.cancel')}
          isLoading={isSubmitting}
          isNextDisabled={isDocumentRejected ? false : (isSubmitting || !isFormComplete)}
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
            <View className="space-y-4 mb-6">
              <Input
                label="RUT"
                value={formData.rut}
                onChangeText={(value) => handleInputChange('rut', value)}
                placeholder="12.345.678-9"
                disabled={isRutLocked}
              />

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
          )}
        </FormLayout>
      </>
    );
  }

  if (formData.firstName || formData.lastName || formData.documentNumber) {
    return (
      <>
        <SuccessMessage visible={showSuccess} message="Formulario actualizado correctamente" />
        <FormLayout
          title={t('identityConfirm.title')}
          subtitle={t('identityConfirm.verificationSuccess')}
          currentStep={3}
          totalSteps={3}
          onNext={handleContinue}
          onCancel={handleCancel}
          nextButtonTitle={isSubmitting ? t('common.sending') : t('common.finish')}
          cancelButtonTitle={t('common.cancel')}
          isLoading={isSubmitting}
          isNextDisabled={isSubmitting || !isFormComplete}
          showLogo={false}
        >
          <View className="space-y-4 mb-6">
            <Input
              label="RUT"
              value={formData.rut}
              onChangeText={(value) => handleInputChange('rut', value)}
              placeholder="12.345.678-9"
              disabled={isRutLocked}
            />

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

  return (
    <FormLayout
      title={t('identityConfirm.title')}
      subtitle=""
      currentStep={3}
      totalSteps={3}
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
