import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '@/components/ui/Container';
import FormLayout from '@/components/ui/FormLayout';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import RadioButton from '@/components/ui/RadioButton';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { createBankAccount } from '@/services/investment/bank-accounts/create-bank-account';
import { useAuth } from '@/providers/AuthProvider';

const BANK_OPTIONS = [
  { label: 'Bice', value: '2' },
  { label: 'Chile-Edwards', value: '3' },
  { label: 'Banco de Crédito e Inversiones (BCI)', value: '4' },
  { label: 'Banco del Desarrollo', value: '5' },
  { label: 'Falabella', value: '6' },
  { label: 'Internacional', value: '7' },
  { label: 'Penta', value: '9' },
  { label: 'Santander', value: '10' },
  { label: 'Banco Security', value: '11' },
  { label: 'Banco Estado', value: '12' },
  { label: 'BBVA', value: '13' },
  { label: 'Citibank N.A. Chile', value: '14' },
  { label: 'Itau-Corpbanca', value: '15' },
  { label: 'Scotiabank', value: '16' },
  { label: 'Credichile', value: '17' },
  { label: 'Credit Suisse', value: '18' },
  { label: 'Deutsche Bank', value: '19' },
  { label: 'ING Bank', value: '20' },
  { label: 'Ripley', value: '21' },
  { label: 'Banco de Santiago', value: '22' },
  { label: 'TBanc', value: '23' },
  { label: 'Consorcio', value: '24' },
  { label: 'Copeuch', value: '25' },
  { label: 'Prepago Los Héroes', value: '26' },
  { label: 'Tenpo Prepago', value: '27' },
  { label: 'Mercado Pago', value: '28' },
  { label: 'TAPP Caja Los Andes', value: '29' },
];

const ACCOUNT_TYPE_OPTIONS = [
  { label: 'Cuenta Corriente', value: 'checking' },
  { label: 'Cuenta de Ahorro', value: 'savings' },
  { label: 'Cuenta Vista', value: 'vista' },
  { label: 'Chequera Electrónica', value: 'electronic_checkbook' },
];

const DEFAULT_OPTIONS = [
  { label: 'No', value: 'false' },
  { label: 'Sí, establecer como cuenta predeterminada', value: 'true' },
];

export default function AddBankAccountPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { accessToken } = useAuth();

  const [formData, setFormData] = useState({
    bank_id: '',
    account_number: '',
    kind: '',
    is_default: 'false',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.bank_id) {
      errors.push('Selecciona un banco');
    }

    if (!formData.kind) {
      errors.push('Selecciona el tipo de cuenta');
    }

    if (!formData.account_number.trim()) {
      errors.push('Ingresa el número de cuenta');
    } else if (formData.account_number.length < 8) {
      errors.push('El número de cuenta debe tener al menos 8 dígitos');
    }

    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();

    if (errors.length > 0) {
      Alert.alert('Error', errors.join('\n'));
      return;
    }

    if (!accessToken) {
      Alert.alert('Error', 'No hay sesión activa');
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData = {
        bank_account: {
          bank_id: parseInt(formData.bank_id),
          account_number: formData.account_number,
          kind: formData.kind,
          is_default: formData.is_default === 'true',
        }
      };

      const response = await createBankAccount(requestData, accessToken);

      if (response.success) {
        Alert.alert(
          'Éxito',
          'Cuenta bancaria agregada correctamente',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Error', response.message || 'No se pudo agregar la cuenta');
      }
    } catch (error) {
      console.error('Error creating bank account:', error);
      Alert.alert('Error', 'Ocurrió un error al agregar la cuenta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const isFormValid = formData.bank_id && formData.kind && formData.account_number.trim().length >= 8;

  return (
    <Container variant="secondaryPage" className="flex-1">
      <FormLayout
        title={t('settings.bankAccounts.addForm.title')}
        subtitle={t('settings.bankAccounts.addForm.subtitle')}
        currentStep={1}
        totalSteps={1}
        onNext={handleSubmit}
        onCancel={handleCancel}
        nextButtonTitle={t('settings.bankAccounts.addForm.save')}
        cancelButtonTitle={t('common.cancel')}
        isNextDisabled={!isFormValid || isSubmitting}
        showLogo={false}
      >
        <View className="space-y-4">
          {/* Bank Selection */}
          <View>
            <Text className="text-base font-medium mb-2" style={{ color: Colors.primary[500] }}>
              {t('settings.bankAccounts.addForm.bankLabel')}
            </Text>
            <Select
              options={BANK_OPTIONS}
              value={formData.bank_id}
              onSelect={(value) => handleInputChange('bank_id', value)}
              placeholder={t('settings.bankAccounts.addForm.bankPlaceholder')}
            />
          </View>

          {/* Account Type Selection */}
          <View>
            <Text className="text-base font-medium mb-2" style={{ color: Colors.primary[500] }}>
              {t('settings.bankAccounts.addForm.accountTypeLabel')}
            </Text>
            <Select
              options={ACCOUNT_TYPE_OPTIONS}
              value={formData.kind}
              onSelect={(value) => handleInputChange('kind', value)}
              placeholder={t('settings.bankAccounts.addForm.accountTypePlaceholder')}
            />
          </View>

          {/* Account Number Input */}
          <View>
            <Text className="text-base font-medium mb-2" style={{ color: Colors.primary[500] }}>
              {t('settings.bankAccounts.addForm.accountNumberLabel')}
            </Text>
            <Input
              value={formData.account_number}
              onChangeText={(value) => handleInputChange('account_number', value)}
              placeholder={t('settings.bankAccounts.addForm.accountNumberPlaceholder')}
              keyboardType="numeric"
              maxLength={20}
            />
          </View>

          {/* Default Account Selection */}
          <RadioButton
            label={t('settings.bankAccounts.addForm.setAsDefault')}
            options={DEFAULT_OPTIONS}
            selectedValue={formData.is_default}
            onSelect={(value) => handleInputChange('is_default', value)}
          />
        </View>
      </FormLayout>
    </Container>
  );
}