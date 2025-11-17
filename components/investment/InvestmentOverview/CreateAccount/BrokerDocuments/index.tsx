import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { router } from 'expo-router';
import { FormLayout, SuccessMessage, LoadingSpinner } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';
import { FileText, AlertCircle, Check } from 'lucide-react-native';
import { checkRequirements, signContracts } from '@/services/investment/create-account/broker-documentation';

export default function ContractSignature() {
  const { t } = useTranslation();
  const { accessToken } = useAuth();

  const [acceptedContracts, setAcceptedContracts] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingRequirements, setIsCheckingRequirements] = useState(true);
  const [canSign, setCanSign] = useState(false);

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
      text: 'He leído y acepto el contrato de prestación de servicios con ',
      highlight: 'Vector Capital Corredora de Bolsa SpA.',
      value: 'vector_capital',
      link: '#' // Aquí iría el link real al PDF del contrato
    },
    {
      text: 'He leído y acepto el contrato de mandato mercantil e inversión con ',
      highlight: 'Patrimore S.A.',
      value: 'patrimore_mandate',
      link: '#' // Aquí iría el link real al PDF del contrato
    },
    {
      text: 'He leído y acepto el código de conducta de ',
      highlight: 'Patrimore S.A.',
      value: 'patrimore_conduct',
      link: '#' // Aquí iría el link real al PDF del contrato
    }
  ];

  const handleCheckboxSelect = (value: string) => {
    setAcceptedContracts(prev => {
      if (prev.includes(value)) {
        return prev.filter(item => item !== value);
      }
      return [...prev, value];
    });
  };

  const handleDocumentPress = (link: string) => {
    // Aquí se abriría el documento para leer
    if (link && link !== '#') {
      Linking.openURL(link);
    }
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

  if (isCheckingRequirements) {
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
                <TouchableOpacity
                  key={contract.value}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  onPress={() => handleCheckboxSelect(contract.value)}
                  activeOpacity={0.7}
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
                      marginRight: 12,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: isSelected ? Colors.primary[500] : 'transparent',
                    }}
                  >
                    {isSelected && (
                      <Check size={12} color="white" strokeWidth={3} />
                    )}
                  </View>

                  <Text
                    className="text-base font-regular flex-1"
                    style={{ color: Colors.gray[700] }}
                  >
                    {contract.text}
                    <Text className="font-medium" style={{ color: Colors.secondary[500] }}>
                      {contract.highlight}
                    </Text>
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Botones para ver documentos */}
          <View style={{ marginTop: 16, gap: 12 }}>
            {contractOptions.map((contract) => {
              if (contract.link && contract.link !== '#') {
                return (
                  <TouchableOpacity
                    key={`doc-${contract.value}`}
                    onPress={() => handleDocumentPress(contract.link)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingLeft: 4,
                    }}
                    activeOpacity={0.7}
                  >
                    <FileText size={16} color={Colors.primary[500]} />
                    <Text
                      className="text-sm font-medium"
                      style={{ color: Colors.primary[500], marginLeft: 8 }}
                    >
                      {t('contractSignature.viewDocument')}
                    </Text>
                  </TouchableOpacity>
                );
              }
              return null;
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

