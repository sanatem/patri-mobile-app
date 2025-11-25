import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { router } from 'expo-router';
import { FormLayout, SuccessMessage, LoadingSpinner } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';
import { AlertCircle, Check } from 'lucide-react-native';
import {
  checkRequirements,
  signContracts,
  getBrokerDocumentations,
} from '@/services/investment/create-account/broker-documentation';

export default function ContractSignature() {
  const { t } = useTranslation();
  const { accessToken } = useAuth();

  const [acceptedContracts, setAcceptedContracts] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingRequirements, setIsCheckingRequirements] = useState(true);
  const [canSign, setCanSign] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  useEffect(() => {
    checkContractRequirements();
  }, [accessToken]);

  const checkContractRequirements = async () => {
    if (!accessToken) {
      setIsCheckingRequirements(false);
      return;
    }

    try {
      const response = await checkRequirements(accessToken);

      if (response.success && response.data) {
        setCanSign(response.data.requirements_met);

        if (!response.data.requirements_met) {
          const errorMessages = response.data.missing_requirements
            .map(req => req.message)
            .join(', ');
          setError(`Requisitos pendientes: ${errorMessages}`);
        }
      } else {
        setError(response.message || 'Error al verificar requisitos');
      }
    } catch (err) {
      console.error('Error checking requirements:', err);
      setError('Error al verificar requisitos de firma');
    } finally {
      setIsCheckingRequirements(false);
    }
  };

  // Opciones de contratos a firmar con texto destacado
  const contractOptions = [
    {
      textBefore: 'He leído y acepto el ',
      highlight: 'contrato',
      textAfter: ' de prestación de servicios con Vector Capital Corredora de Bolsa SpA.',
      value: 'vector_capital',
      broker_code: 'vector',
      isLocalPdf: false,
      document_type: undefined
    },
    {
      textBefore: 'He leído y acepto el ',
      highlight: 'mandato mercantil',
      textAfter: ' e inversión con Patrimore S.A.',
      value: 'patrimore_mandate',
      broker_code: 'vector',
      isLocalPdf: false,
      document_type: 'commercial_mandate'
    },
    {
      textBefore: 'He leído y acepto las ',
      highlight: 'normas de conducta',
      textAfter: ' de Patrimore S.A.',
      value: 'patrimore_conduct',
      broker_code: 'patrimore',
      isLocalPdf: true,
      document_type: undefined
    }
  ];

  const handlePreviewDocument = async (brokerCode: string, isLocalPdf: boolean, documentType?: string) => {
    // Si es PDF local, navegar al visor de PDF
    if (isLocalPdf) {
      router.push('/(tabs)/investment/create-account/pdf-viewer' as any);
      return;
    }

    if (!accessToken) return;

    setIsLoadingPreview(true);
    setError(null);

    try {
      // Obtener los documentos del broker
      const docsResponse = await getBrokerDocumentations(accessToken);

      if (!docsResponse.success) {
        setError('Error al obtener los documentos');
        return;
      }

      const document = docsResponse.broker_documents.find(doc => doc.broker_code === brokerCode);
      if (!document) {
        setError('No se encontró el documento');
        return;
      }

      // Usar la URL correspondiente según el tipo de documento
      let url: string | undefined;
      if (documentType === 'commercial_mandate') {
        url = document.commercial_mandate_url;
      } else {
        url = document.file_url;
      }

      if (url) {
        await Linking.openURL(url);
      } else {
        setError('No se encontró la URL del documento');
      }
    } catch (err) {
      console.error('Error previewing document:', err);
      setError('Error al abrir el documento');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleCheckboxSelect = (value: string) => {
    setAcceptedContracts(prev => {
      if (prev.includes(value)) {
        return prev.filter(item => item !== value);
      }
      return [...prev, value];
    });
  };


  const handleSubmit = async () => {
    if (acceptedContracts.length !== contractOptions.length) {
      setError(t('contractSignature.warning'));
      return;
    }

    if (!canSign) {
      setError('Debes completar todos los requisitos antes de firmar los contratos');
      return;
    }

    if (!accessToken) {
      setError('No se encontró token de autenticación');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await signContracts(accessToken);

      if (response.success) {
        setShowSuccess(true);

        setTimeout(() => {
          router.push('/(tabs)/investment/create-account/complete-profile' as any);
        }, 2000);
      } else {
        setError(response.message || t('contractSignature.error'));
      }
    } catch (err) {
      console.error('Error signing contracts:', err);
      setError(t('contractSignature.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/(tabs)/investment/create-account/complete-profile' as any);
  };

  const allContractsAccepted = acceptedContracts.length === contractOptions.length;

  if (isCheckingRequirements || isLoadingPreview) {
    return <LoadingSpinner overlay />;
  }

  return (
    <>
      <SuccessMessage visible={showSuccess} message="Los contratos se firmaron correctamente" />
      <FormLayout
        title={t('contractSignature.title')}
        subtitle={t('contractSignature.subtitle')}
        currentStep={1}
        totalSteps={1}
        onNext={handleSubmit}
        onCancel={handleCancel}
        nextButtonTitle={isSubmitting ? 'Firmando...' : 'Finalizar'}
        cancelButtonTitle="Cancelar"
        isLoading={isSubmitting}
        isNextDisabled={!allContractsAccepted || isSubmitting || !canSign}
        error={error}
        showLogo={false}
      >
        <View style={{ marginBottom: 20 }}>
          {/* Checkboxes personalizados con texto destacado */}
          <View style={{ gap: 12 }}>
            {contractOptions.map((contract) => {
              const isSelected = acceptedContracts.includes(contract.value);

              return (
                <View
                  key={contract.value}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                  }}
                >
                  <TouchableOpacity
                    onPress={() => handleCheckboxSelect(contract.value)}
                    activeOpacity={0.7}
                    style={{
                      padding: 2,
                      marginRight: 10,
                    }}
                  >
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: isSelected
                          ? Colors.primary[500]
                          : Colors.gray[300],
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: isSelected ? Colors.primary[500] : 'transparent',
                      }}
                    >
                      {isSelected && (
                        <Check size={12} color="white" strokeWidth={3} />
                      )}
                    </View>
                  </TouchableOpacity>

                  <View style={{ flex: 1 }}>
                    <Text
                      className="text-base font-regular"
                      style={{ color: Colors.gray[700] }}
                    >
                      {contract.textBefore}
                      <Text
                        className="font-medium"
                        style={{ color: Colors.secondary[500], textDecorationLine: 'underline' }}
                        onPress={() => handlePreviewDocument(contract.broker_code, contract.isLocalPdf, contract.document_type)}
                      >
                        {contract.highlight}
                      </Text>
                      {contract.textAfter}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {!allContractsAccepted && (
          <View 
            style={{ 
              backgroundColor: 'white', 
              padding: 12, 
              borderRadius: 8,
              marginTop: 8,
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <AlertCircle size={20} color={Colors.gray[500]} style={{ marginRight: 8 }} />
            <Text 
              className="text-sm font-regular flex-1" 
              style={{ color: Colors.gray[500] }}
            >
              {t('contractSignature.warning')}
            </Text>
          </View>
        )}
      </FormLayout>
    </>
  );
}

