import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { FormLayout, Select, Input, RadioButton, SuccessMessage } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/providers/AuthProvider';
import { createGoal } from '@/services/investment/portfolio/goals/create-goal';
import Colors from '@/constants/Colors';
import config from '@/config/constants';

export default function CreateGoalsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const [investmentAccountId, setInvestmentAccountId] = useState<number | null>(null);

  const [goalType, setGoalType] = useState('');
  const [goalName, setGoalName] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [currency, setCurrency] = useState('CLP');
  const [amount, setAmount] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccountId = async () => {
      if (!accessToken) return;

      try {
        const url = `${config.apiBaseUrl}/api/v2/goals`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const responseData = await response.json();
          // La respuesta tiene la estructura: { success: true, data: { investment: {...} } }
          const data = responseData.data || responseData;
          const accountId = data.investment?.account_id;
          if (accountId) {
            setInvestmentAccountId(accountId);
          } else {
            console.error('No se encontró account_id en la respuesta:', responseData);
          }
        }
      } catch (error) {
        console.error('Error fetching investment account ID:', error);
      }
    };

    fetchAccountId();
  }, [accessToken]);

  const goalTypeOptions = [
    { label: 'Pago de deuda', value: 'debt_payment' },
    { label: 'Fondo de inversión', value: 'investment_fund' },
    { label: 'Bienes raíces', value: 'real_estate' },
    { label: 'Jubilación/Retiro', value: 'retirement' },
    { label: 'Fondo de ahorro', value: 'savings_fund' },
    { label: 'Estudios', value: 'study' },
    { label: 'Viajes', value: 'travel' },
    { label: 'Vehículo', value: 'vehicle' },
    { label: 'Personalizado', value: 'personalized' },
  ];

  const timeframeOptions = [
    { label: 'En menos de 1 año', value: 'less_than_one_year' },
    { label: 'Entre 1 y 3 años', value: 'one_to_three_years' },
    { label: 'Entre 3 y 5 años', value: 'three_to_five_years' },
    { label: 'Entre 5 y 9 años', value: 'five_to_nine_years' },
    { label: 'En más de 9 años', value: 'nine_or_more_years' },
  ];

  const currencyOptions = [
    { label: 'CLP', value: 'CLP' },
    { label: 'USD', value: 'USD' },
    { label: 'EUR', value: 'EUR' },
  ];

  const handleCreate = async () => {
    if (!goalType) {
      setError('El tipo de meta es obligatorio');
      return;
    }
    if (!goalName.trim()) {
      setError('El nombre de la meta es obligatorio');
      return;
    }
    if (!timeframe) {
      setError('Debes seleccionar cuándo quieres alcanzar tu meta');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Debes ingresar un monto válido');
      return;
    }

    if (!investmentAccountId) {
      setError('No se pudo obtener el ID de la cuenta de inversión');
      return;
    }

    if (!accessToken) {
      setError('No hay sesión activa');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await createGoal(accessToken, {
        name: goalName,
        kind: goalType,
        target_amount: amount,
        term: timeframe,
        unit: currency.toLowerCase(),
        investment_account_id: investmentAccountId,
        default: false,
      });

      if (response.success) {
        setShowSuccess(true);

        setTimeout(() => {
          router.push('/(tabs)/investment/portfolio' as any);
        }, 2000);
      } else {
        setError(response.message || 'Error al crear la meta. Por favor, intenta nuevamente.');
      }
    } catch (err) {
      console.error('Error creating goal:', err);
      setError('Error al crear la meta. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const isFormValid =
    goalType.length > 0 &&
    goalName.trim().length > 0 &&
    timeframe.length > 0 &&
    amount.length > 0 &&
    parseFloat(amount) > 0;

  return (
    <>
      <SuccessMessage visible={showSuccess} message="La meta se creó correctamente" />
      <FormLayout
        title="Crear meta 🎯"
        subtitle="Define tu objetivo financiero y el plazo para alcanzarlo"
        currentStep={1}
        totalSteps={1}
        onNext={handleCreate}
        onCancel={handleCancel}
        nextButtonTitle={isSubmitting ? 'Creando...' : 'Crear meta'}
        cancelButtonTitle="Cancelar"
        isLoading={isSubmitting}
        isNextDisabled={!isFormValid || isSubmitting}
        error={error}
        showLogo={false}
      >
        <View style={{ gap: 20 }}>  
          <Select
            label="¿Qué tipo de meta es?"
            placeholder="Selecciona el tipo"
            options={goalTypeOptions}
            value={goalType}
            onSelect={setGoalType}
          />

          <Input
            label="¿Cuál es tu meta?"
            placeholder="Ingresa el nombre"
            value={goalName}
            onChangeText={setGoalName}
          />

          <RadioButton
            label="¿Cuándo quieres alcanzarla?"
            options={timeframeOptions}
            selectedValue={timeframe}
            onSelect={setTimeframe}
          />

          <View>
            <Text
              className="text-base font-medium mb-4"
              style={{ color: Colors.gray[700] }}
            >
              ¿Cuánto necesitas ahorrar?
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-end' }}>
              <View style={{ width: 100 }}>
                <Select
                  options={currencyOptions}
                  value={currency}
                  onSelect={setCurrency}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  placeholder="0"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </View>
      </FormLayout>
    </>
  );
}
