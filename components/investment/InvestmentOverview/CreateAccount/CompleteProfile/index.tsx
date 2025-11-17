import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Container } from '@/components/ui/Container';
import { Header } from '@/components/ui/Header';
import { Card, LoadingSpinner } from '@/components/ui';
import { Check, Clock, ChevronRight, ChevronLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';
import { getContactInformation } from '@/services/investment/create-account/contact-information/get-contact-information';
import { getPersonalInformation } from '@/services/investment/create-account/personal-information/get-personal-information';
import { getRiskProfile } from '@/services/investment/create-account/investment-survey/get-risk-profile';
import { getEmploymentInformation } from '@/services/investment/create-account/employment-information/get-employment-information';
import { getIdentityCard } from '@/services/investment/create-account/identity-verification/get-identity-verification';
import { checkRequirements } from '@/services/investment/create-account/broker-documentation';

export default function SummaryStep() {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formStatuses, setFormStatuses] = useState({
    riskProfile: false,
    identity: false,
    personalInfo: false,
    contactInfo: false,
    workInfo: false,
    contractSignature: false,
  });
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useFocusEffect(
    useCallback(() => {
      checkFormStatuses();
    }, [accessToken])
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsLoading(false);
    };
  }, []);

  const checkFormStatuses = async () => {
    if (!accessToken) {
      setIsLoadingStatuses(false);
      return;
    }

    try {
      const [contactResponse, personalResponse, riskResponse, employmentResponse, identityResponse, requirementsResponse] = await Promise.all([
        getContactInformation(accessToken),
        getPersonalInformation(accessToken),
        getRiskProfile(accessToken),
        getEmploymentInformation(accessToken),
        getIdentityCard(accessToken),
        checkRequirements(accessToken),
      ]);

      const hasContactData = !!(
        contactResponse.success &&
        contactResponse.contact_information &&
        (contactResponse.contact_information.address ||
          contactResponse.contact_information.phones?.length ||
          contactResponse.contact_information.floor_number)
      );

      // Verificar que todos los campos obligatorios del formulario de información personal estén llenos
      const personalInfo = personalResponse.personal_information;
      const hasPersonalData = !!(
        personalResponse.success &&
        personalInfo &&
        personalInfo.sex &&
        personalInfo.gender &&
        personalInfo.employment_situation &&
        personalInfo.marital_status &&
        // conjugal_regime es obligatorio solo si está casado
        (personalInfo.marital_status !== 'married' || personalInfo.conjugal_regime) &&
        personalInfo.us_person !== undefined &&
        personalInfo.pep !== undefined &&
        personalInfo.has_broker_relationship_with_vector !== undefined &&
        // broker_relationship_type es obligatorio solo si tiene relación con Vector
        (!personalInfo.has_broker_relationship_with_vector || personalInfo.broker_relationship_type) &&
        personalInfo.has_a_broker_relationship !== undefined
      );

      const hasRiskData = !!(
        riskResponse.success &&
        riskResponse.risk_profile &&
        riskResponse.investor_questionnaire?.investor_category
      );

      // Verificar si el identity card existe y tiene imágenes
      const hasIdentityData = !!(
        identityResponse.success &&
        identityResponse.identity_card &&
        identityResponse.identity_card.front_url &&
        identityResponse.identity_card.back_url &&
        identityResponse.identity_card.verified !== false
      );

      const hasWorkData = !!(
        employmentResponse.success &&
        employmentResponse.employment_information &&
        (employmentResponse.employment_information.company_name ||
          employmentResponse.employment_information.company_rut ||
          employmentResponse.employment_information.charge ||
          employmentResponse.employment_information.profession ||
          employmentResponse.employment_information.commercial_activity)
      );

      // Verificar si se pueden firmar los contratos según el backend
      const canSignContracts = !!(
        requirementsResponse.success &&
        requirementsResponse.data?.requirements_met
      );

      setFormStatuses({
        riskProfile: hasRiskData,
        identity: hasIdentityData,
        personalInfo: hasPersonalData,
        contactInfo: hasContactData,
        workInfo: hasWorkData,
        contractSignature: canSignContracts,
      });
    } catch (error) {
      console.error('Error checking form statuses:', error);
    } finally {
      setIsLoadingStatuses(false);
    }
  };

  const handleCardPress = async (route: string) => {
    setIsLoading(true);
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      router.push(route as any);
    }, 300);
  };

  // Verificar si todos los formularios base están completados (sin incluir contractSignature)
  const allBaseFormsCompleted = !isLoadingStatuses &&
    formStatuses.riskProfile &&
    formStatuses.identity &&
    formStatuses.personalInfo &&
    formStatuses.contactInfo &&
    formStatuses.workInfo;

  // La firma de contrato se habilita cuando todos los formularios base están completos
  const canAccessContractSignature = allBaseFormsCompleted;

  // TODO ESTÁ COMPLETADO cuando todos los formularios base + firma de contrato están listos
  const allFormsCompleted = allBaseFormsCompleted && formStatuses.contractSignature;

  // Determinar qué título y descripción mostrar
  const title = allFormsCompleted ? t('investmentAccount.titleCompleted') : t('investmentAccount.title');
  const description = allFormsCompleted ? t('investmentAccount.descriptionCompleted') : t('investmentAccount.description');

  const handleBackPress = () => {
    router.push('/(tabs)/investment' as any);
  };

  return (
    <Container variant="secondaryPage">
      <Header 
        title={title} 
        showBackButton={false}
        leftAction={
          <TouchableOpacity
            onPress={handleBackPress}
            className="p-1 mr-3"
          >
            <ChevronLeft size={24} color={Colors.primary[600]} />
          </TouchableOpacity>
        }
      />
      {(isLoading || isLoadingStatuses) && <LoadingSpinner overlay />}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
      >
        {allFormsCompleted ? (
          <Text className="text-base font-regular text-center mb-6 mt-4" style={{ color: Colors.gray[600] }}>
            {description}
          </Text>
        ) : (
          <Text className="text-base font-regular text-center mb-6 mt-4" style={{ color: Colors.gray[600] }}>
            Completa los siguientes formularios para crear tu <Text className="font-medium">cuenta de inversión</Text> 📈
          </Text>
        )}

        <TouchableOpacity 
          onPress={() => handleCardPress('/(tabs)/investment/create-account/investment-survey/start-profile')}
          activeOpacity={0.7}
        >
          <Card variant="elevated" className="mb-4">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <View className="flex-row items-center mb-1" style={{ alignItems: 'center' }}>
                  <Text className="text-base font-medium" style={{ color: Colors.primary[500], lineHeight: 20 }}>
                    Perfil de riesgo
                  </Text>
                  {!isLoadingStatuses && (
                    <View style={{ marginLeft: 8, marginTop: -1 }}>
                      {formStatuses.riskProfile ? (
                        <Check size={16} color={Colors.success[500]} />
                      ) : (
                        <Clock size={16} color={Colors.warning[500]} />
                      )}
                    </View>
                  )}
                </View>
                <Text className="text-sm font-regular" style={{ color: Colors.gray[600] }}>
                  ¿Qué tanto riesgo deberías tomar con tus inversiones? Descúbrelo aquí
                </Text>
              </View>
              <ChevronRight size={20} color={Colors.gray[500]} />
            </View>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => handleCardPress('/(tabs)/investment/create-account/identity-step/identity-upload')}
          activeOpacity={0.7}
        >
          <Card variant="elevated" className="mb-4">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <View className="flex-row items-center mb-1" style={{ alignItems: 'center' }}>
                    <Text className="text-base font-medium" style={{ color: Colors.primary[500], lineHeight: 20 }}>
                      {t('investmentAccount.steps.identity.title')}
                    </Text>
                  {!isLoadingStatuses && (
                    <View style={{ marginLeft: 8, marginTop: -1 }}>
                      {formStatuses.identity ? (
                        <Check size={16} color={Colors.success[500]} />
                      ) : (
                        <Clock size={16} color={Colors.warning[500]} />
                      )}
                    </View>
                  )}
                </View>
                <Text className="text-sm font-regular" style={{ color: Colors.gray[600] }}>
                  Carga las imágenes de tu cédula para comenzar a validar tu cuenta
                </Text>
              </View>
              <ChevronRight size={20} color={Colors.gray[500]} />
            </View>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => handleCardPress('/(tabs)/investment/create-account/personal-information/personal-information-question')}
          activeOpacity={0.7}
        >
          <Card variant="elevated" className="mb-4">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <View className="flex-row items-center mb-1" style={{ alignItems: 'center' }}>
                  <Text className="text-base font-medium" style={{ color: Colors.primary[500], lineHeight: 20 }}>
                    Información personal
                  </Text>
                  {!isLoadingStatuses && (
                    <View style={{ marginLeft: 8, marginTop: -1 }}>
                      {formStatuses.personalInfo ? (
                        <Check size={16} color={Colors.success[500]} />
                      ) : (
                        <Clock size={16} color={Colors.warning[500]} />
                      )}
                    </View>
                  )}
                </View>
                <Text className="text-sm font-regular" style={{ color: Colors.gray[600] }}>
                  Cuéntanos un poco más sobre ti para entregarte una asesoría 100% personalizada
                </Text>
              </View>
              <ChevronRight size={20} color={Colors.gray[500]} />
            </View>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => handleCardPress('/(tabs)/investment/create-account/personal-information/contact-information-question')}
          activeOpacity={0.7}
        >
          <Card variant="elevated" className="mb-4">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <View className="flex-row items-center mb-1" style={{ alignItems: 'center' }}>
                  <Text className="text-base font-medium" style={{ color: Colors.primary[500], lineHeight: 20 }}>
                    Información de contacto
                  </Text>
                  {!isLoadingStatuses && (
                    <View style={{ marginLeft: 8, marginTop: -1 }}>
                      {formStatuses.contactInfo ? (
                        <Check size={16} color={Colors.success[500]} />
                      ) : (
                        <Clock size={16} color={Colors.warning[500]} />
                      )}
                    </View>
                  )}
                </View>
                <Text className="text-sm font-regular" style={{ color: Colors.gray[600] }}>
                  Completa tu perfil para poder contactarte en cualquier momento
                </Text>
              </View>
              <ChevronRight size={20} color={Colors.gray[500]} />
            </View>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleCardPress('/(tabs)/investment/create-account/personal-information/employment-information-question')}
          activeOpacity={0.7}
        >
          <Card variant="elevated" className="mb-4">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <View className="flex-row items-center mb-1" style={{ alignItems: 'center' }}>
                  <Text className="text-base font-medium" style={{ color: Colors.primary[500], lineHeight: 20 }}>
                    Información laboral
                  </Text>
                  {!isLoadingStatuses && (
                    <View style={{ marginLeft: 8, marginTop: -1 }}>
                      {formStatuses.workInfo ? (
                        <Check size={16} color={Colors.success[500]} />
                      ) : (
                        <Clock size={16} color={Colors.warning[500]} />
                      )}
                    </View>
                  )}
                </View>
                <Text className="text-sm font-regular" style={{ color: Colors.gray[600] }}>
                  Cuéntanos un poco más de tu empleador y su rol en la empresa
                </Text>
              </View>
              <ChevronRight size={20} color={Colors.gray[500]} />
            </View>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => canAccessContractSignature && handleCardPress('/(tabs)/investment/create-account/broker-documents')}
          activeOpacity={canAccessContractSignature ? 0.7 : 1}
          disabled={!canAccessContractSignature}
        >
          <Card variant="elevated" className="mb-4" style={{ opacity: canAccessContractSignature ? 1 : 0.5 }}>
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <View className="flex-row items-center mb-1" style={{ alignItems: 'center' }}>
                  <Text className="text-base font-medium" style={{ color: Colors.primary[500], lineHeight: 20 }}>
                    Firma del contrato
                  </Text>
                  {!isLoadingStatuses && canAccessContractSignature && (
                    <View style={{ marginLeft: 8, marginTop: -1 }}>
                      {formStatuses.contractSignature ? (
                        <Check size={16} color={Colors.success[500]} />
                      ) : (
                        <Clock size={16} color={Colors.warning[500]} />
                      )}
                    </View>
                  )}
                </View>
                <Text className="text-sm font-regular" style={{ color: Colors.gray[600] }}>
                  Lee y acepta los términos y condiciones para abrir tu cuenta de inversión
                </Text>
              </View>
              {canAccessContractSignature && <ChevronRight size={20} color={Colors.gray[500]} />}
            </View>
          </Card>
        </TouchableOpacity>
      </ScrollView>
    </Container>
  );
}
