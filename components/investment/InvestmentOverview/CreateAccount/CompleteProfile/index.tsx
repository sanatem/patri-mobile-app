import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Container } from '@/components/ui/Container';
import { Header } from '@/components/ui/Header';
import { Card, LoadingSpinner } from '@/components/ui';
import { Check, Clock, ChevronRight, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';
import { getContactInformation } from '@/services/investment/create-account/contact-information/get-contact-information';
import { getPersonalInformation } from '@/services/investment/create-account/personal-information/get-personal-information';
import { getRiskProfile } from '@/services/investment/create-account/investment-survey/get-risk-profile';
import { getEmploymentInformation } from '@/services/investment/create-account/employment-information/get-employment-information';
import { getIdentityCard } from '@/services/investment/create-account/identity-verification/get-identity-verification';
import { checkRequirements, generateBrokerDocumentations, getBrokerDocumentations } from '@/services/investment/create-account/broker-documentation';
import { getBankAccounts } from '@/services/investment/bank-accounts/get-bank-account';
import { getSpouseInformation } from '@/services/investment/create-account/spouse-information';

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
    bankData: false,
    spouseInfo: false,
    contractSignature: false,
  });
  const [isMarried, setIsMarried] = useState(false);
  const [isDependentWorker, setIsDependentWorker] = useState(false);
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(true);
  const [accountStatus, setAccountStatus] = useState<'forms' | 'pending' | 'approved' | 'rejected'>('forms');
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
      const requirementsResponse = await checkRequirements(accessToken);

      if (requirementsResponse.success) {
        const brokerDocs = requirementsResponse.data?.details?.forms_status?.broker_documents;
        const isApproved = brokerDocs?.some(doc => doc.status === 'approved');

        if (isApproved) {
          setIsLoadingStatuses(false);
          router.replace('/(tabs)/investment/portfolio');
          return;
        }
      }

      const [contactResponse, personalResponse, riskResponse, employmentResponse, identityResponse, bankAccountsResponse, spouseResponse] = await Promise.all([
        getContactInformation(accessToken),
        getPersonalInformation(accessToken),
        getRiskProfile(accessToken),
        getEmploymentInformation(accessToken),
        getIdentityCard(accessToken),
        getBankAccounts(accessToken),
        getSpouseInformation(accessToken),
      ]);

      const hasContactData = !!(
        contactResponse.success &&
        contactResponse.contact_information &&
        (contactResponse.contact_information.address ||
          contactResponse.contact_information.phones?.length ||
          contactResponse.contact_information.floor_number)
      );

      const personalInfo = personalResponse.personal_information;
      const hasPersonalData = !!(
        personalResponse.success &&
        personalInfo &&
        personalInfo.sex &&
        personalInfo.gender &&
        personalInfo.employment_situation &&
        personalInfo.marital_status &&
        (personalInfo.marital_status !== 'married' || personalInfo.conjugal_regime) &&
        personalInfo.us_person !== undefined &&
        personalInfo.pep !== undefined &&
        personalInfo.has_broker_relationship_with_vector !== undefined &&
        (!personalInfo.has_broker_relationship_with_vector || personalInfo.broker_relationship_type) &&
        personalInfo.has_a_broker_relationship !== undefined
      );

      const userRequiresSpouse = !!(
        personalInfo &&
        (personalInfo.marital_status === 'married' || personalInfo.marital_status === 'civil_union')
      );
      setIsMarried(userRequiresSpouse);

      const userIsDependentWorker = personalInfo?.employment_situation === 'dependent';
      setIsDependentWorker(userIsDependentWorker);

      const spouseInfo = spouseResponse.spouse;

      const hasLocationData = !spouseInfo || spouseInfo.same_address || !!(
        spouseInfo.location_data?.region && spouseInfo.location_data?.commune
      );

      const hasSpouseData = !userRequiresSpouse || !!(
        spouseResponse.success &&
        spouseInfo &&
        spouseInfo.first_name &&
        spouseInfo.last_name &&
        spouseInfo.rut &&
        spouseInfo.birth_date &&
        spouseInfo.nationality &&
        spouseInfo.same_address !== undefined &&
        spouseInfo.broker_relationship &&
        hasLocationData
      );

      const hasRiskData = !!(
        riskResponse.success &&
        riskResponse.risk_profile &&
        riskResponse.investor_questionnaire?.investor_category
      );

      const hasIdentityData = !!(
        identityResponse.success &&
        identityResponse.identity_card &&
        identityResponse.identity_card.front_url &&
        identityResponse.identity_card.back_url &&
        identityResponse.identity_card.verified !== false
      );

      const hasWorkData = !userIsDependentWorker || !!(
        employmentResponse.success &&
        employmentResponse.employment_information &&
        (employmentResponse.employment_information.company_name ||
          employmentResponse.employment_information.company_rut ||
          employmentResponse.employment_information.charge ||
          employmentResponse.employment_information.profession ||
          employmentResponse.employment_information.commercial_activity)
      );

      const areContractsSigned = !!(
        requirementsResponse.success &&
        requirementsResponse.data?.details?.forms_status?.broker_documents &&
        requirementsResponse.data.details.forms_status.broker_documents.length > 0 &&
        requirementsResponse.data.details.forms_status.broker_documents.every(doc => doc.signed)
      );

      const hasDefaultBankAccount = !!(
        bankAccountsResponse.success &&
        bankAccountsResponse.accounts &&
        bankAccountsResponse.accounts.some(account => account.is_default)
      );

      const allBaseCompleted = hasRiskData && hasIdentityData && hasPersonalData && hasContactData && hasWorkData && hasDefaultBankAccount && hasSpouseData;

      const brokerDocsExist = requirementsResponse.data?.details?.forms_status?.broker_documents?.some(doc => doc.exists);

      if (allBaseCompleted && !areContractsSigned && !brokerDocsExist) {
        try {
          await generateBrokerDocumentations(accessToken);
        } catch {
        }
      }

      setFormStatuses({
        riskProfile: hasRiskData,
        identity: hasIdentityData,
        personalInfo: hasPersonalData,
        contactInfo: hasContactData,
        workInfo: hasWorkData,
        bankData: hasDefaultBankAccount,
        spouseInfo: hasSpouseData,
        contractSignature: areContractsSigned,
      });

      if (areContractsSigned) {
        try {
          const brokerDocsResponse = await getBrokerDocumentations(accessToken);

          if (brokerDocsResponse.success && brokerDocsResponse.broker_documents.length > 0) {
            const statuses = brokerDocsResponse.broker_documents.map(doc => doc.status);

            if (statuses.every(status => status === 'approved')) {
              setAccountStatus('approved');
              router.replace('/(tabs)/investment' as any);
              return;
            } else if (statuses.some(status => status === 'rejected')) {
              setAccountStatus('rejected');
            } else {
              setAccountStatus('pending');
            }
          }
        } catch {
        }
      }
    } catch {
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

  const allBaseFormsCompleted = !isLoadingStatuses &&
    formStatuses.riskProfile &&
    formStatuses.identity &&
    formStatuses.personalInfo &&
    formStatuses.contactInfo &&
    formStatuses.workInfo &&
    formStatuses.bankData &&
    formStatuses.spouseInfo;

  const canAccessContractSignature = allBaseFormsCompleted;

  const allFormsCompleted = allBaseFormsCompleted && formStatuses.contractSignature;

  const title = allFormsCompleted ? t('investmentAccount.titleCompleted') : t('investmentAccount.title');
  const description = allFormsCompleted ? t('investmentAccount.descriptionCompleted') : t('investmentAccount.description');

  if (accountStatus === 'pending') {
    return (
      <Container variant="secondaryPage">
        <Header
          title="Cuenta de inversión"
          showBackButton={false}
        />
        {isLoadingStatuses && <LoadingSpinner overlay />}
        <View className="flex-1 justify-center items-center px-6 pb-6">
          <View style={{ width: 64, height: 64, backgroundColor: Colors.primary[100], borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
            <Clock size={32} color={Colors.primary[600]} />
          </View>
          <Text className="text-xl font-semibold text-center mb-2" style={{ color: Colors.primary[600] }}>
            Ya casi puedes invertir
          </Text>
          <Text className="text-base font-regular text-center px-4" style={{ color: Colors.gray[600] }}>
            Solo necesitamos validar algunos datos para activar tu cuenta. Si tienes dudas, contáctanos a <Text className="font-medium">operaciones@patrimore.com</Text>.
          </Text>
        </View>
      </Container>
    );
  }

  if (accountStatus === 'rejected') {
    return (
      <Container variant="secondaryPage">
        <Header
          title="Cuenta de inversión"
          showBackButton={false}
        />
        {isLoadingStatuses && <LoadingSpinner overlay />}
        <View className="flex-1 justify-center items-center px-6 pb-6">
          <View style={{ width: 64, height: 64, backgroundColor: Colors.error[100], borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
            <X size={32} color={Colors.error[500]} />
          </View>
          <Text className="text-xl font-semibold text-center mb-2" style={{ color: Colors.primary[600] }}>
            Cuenta rechazada
          </Text>
          <Text className="text-base font-regular text-center px-4" style={{ color: Colors.gray[600] }}>
            Tu solicitud de cuenta de inversión ha sido rechazada. Por favor, contáctanos a <Text style={{ color: Colors.secondary[500] }}>operaciones@patrimore.com</Text> para más información.
          </Text>
        </View>
      </Container>
    );
  }

  return (
    <Container variant="secondaryPage">
      <Header
        title={title}
        showBackButton={false}
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
          onPress={() => handleCardPress(
            formStatuses.riskProfile
              ? '/(tabs)/investment/create-account/investment-survey/profile-result'
              : '/(tabs)/investment/create-account/investment-survey/start-profile'
          )}
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

        {isMarried && (
          <TouchableOpacity
            onPress={() => handleCardPress('/(tabs)/investment/create-account/spouse-information/spouse-information-question')}
            activeOpacity={0.7}
          >
            <Card variant="elevated" className="mb-4">
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <View className="flex-row items-center mb-1" style={{ alignItems: 'center' }}>
                    <Text className="text-base font-medium" style={{ color: Colors.primary[500], lineHeight: 20 }}>
                      Datos del Cónyuge
                    </Text>
                    {!isLoadingStatuses && (
                      <View style={{ marginLeft: 8, marginTop: -1 }}>
                        {formStatuses.spouseInfo ? (
                          <Check size={16} color={Colors.success[500]} />
                        ) : (
                          <Clock size={16} color={Colors.warning[500]} />
                        )}
                      </View>
                    )}
                  </View>
                  <Text className="text-sm font-regular" style={{ color: Colors.gray[600] }}>
                    Por ley necesitamos los datos de tu cónyuge para abrir tu cuenta de inversión
                  </Text>
                </View>
                <ChevronRight size={20} color={Colors.gray[500]} />
              </View>
            </Card>
          </TouchableOpacity>
        )}

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

        {isDependentWorker && (
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
        )}

        {!formStatuses.bankData && !isLoadingStatuses && (
          <TouchableOpacity
            onPress={() => handleCardPress('/settings/bank-accounts/add-bank-account?from=complete-profile')}
            activeOpacity={0.7}
          >
            <Card variant="elevated" className="mb-4">
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <View className="flex-row items-center mb-1" style={{ alignItems: 'center' }}>
                    <Text className="text-base font-medium" style={{ color: Colors.primary[500], lineHeight: 20 }}>
                      Datos bancarios
                    </Text>
                    <View style={{ marginLeft: 8, marginTop: -1 }}>
                      <Clock size={16} color={Colors.warning[500]} />
                    </View>
                  </View>
                  <Text className="text-sm font-regular" style={{ color: Colors.gray[600] }}>
                    Necesitamos que agregues o modifiques una cuenta bancaria predeterminada
                  </Text>
                </View>
                <ChevronRight size={20} color={Colors.gray[500]} />
              </View>
            </Card>
          </TouchableOpacity>
        )}

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
