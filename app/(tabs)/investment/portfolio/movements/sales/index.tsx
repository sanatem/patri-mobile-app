import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Container } from '@/components/ui/Container';
import Colors from '@/constants/Colors';
import FromGoalStep from './from-goal-step';
import FromAssetStep from './from-asset-step';
import ConfirmationStep from './confirmation-step';
import { useTranslation } from 'react-i18next';
import { useGoals } from '@/hooks/investment/useGoals';
import { useFormatValue } from '@/hooks/common/useFormatValue';
import { useAuth } from '@/providers/AuthProvider';
import { getCash } from '@/services/cash/get-cash';
import type { Goal } from '@/types/api';
import type { Cash } from '@/services/cash/get-cash';

export default function SalesFlow() {
  const { t } = useTranslation();
  const { goals: goalsData, loading: goalsLoading } = useGoals();
  const { formatValue } = useFormatValue();
  const { accessToken } = useAuth();
  const [cashData, setCashData] = useState<Cash | null>(null);

  const router = useRouter();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<string | undefined>();
  const [destino, setDestino] = useState<string | undefined>();
  const [activo, setActivo] = useState<string | undefined>();
  const [cuenta, setCuenta] = useState<string | undefined>();
  const [cashAmount, setCashAmount] = useState<string>('');
  const [cashBankAccount, setCashBankAccount] = useState<string | undefined>();
  const [assetAmount, setAssetAmount] = useState<string>('');
  const [assetBankAccount, setAssetBankAccount] = useState<string | undefined>();

  useEffect(() => {
    const loadCashData = async () => {
      if (!accessToken) return;

      try {
        const data = await getCash(accessToken);
        setCashData(data?.cash?.investment || data?.cash?.savings || null);
      } catch (error) {
        console.error('SalesFlow: Error cargando cash:', error);
      }
    };

    loadCashData();
  }, [accessToken]);

  const goals = useMemo(() => {
    const allGoals: Goal[] = [
      ...goalsData.investment.shortTerm,
      ...goalsData.investment.mediumTerm,
      ...goalsData.investment.longTerm,
      ...goalsData.savings.shortTerm,
      ...goalsData.savings.mediumTerm,
      ...goalsData.savings.longTerm,
    ];

    const goalOptions = allGoals.map(goal => {
      // Use available value for retirement if available, otherwise fallback to current values
      const amount = goal.availableValueForRetirement ?? goal.goalWallet ?? goal.currentAmount ?? 0;
      return {
        label: `${goal.name} (${formatValue(amount.toString())})`,
        value: goal.id
      };
    });

    if (cashData) {
      const availableAmount = typeof cashData.available_amount === 'string'
        ? parseFloat(cashData.available_amount)
        : cashData.available_amount;

      goalOptions.push({
        label: `${t('salesFlow.cashBalance')} (${formatValue(availableAmount.toString())})`,
        value: 'cash-balance'
      });
    } else {
      goalOptions.push({
        label: t('salesFlow.cashBalance'),
        value: 'cash-balance'
      });
    }

    return goalOptions;
  }, [goalsData, formatValue, t, cashData]);

  const destinos = useMemo(() => {
    if (!goal || goal === 'cash-balance') {
      return [];
    }

    return [
      {
        label: t('salesFlow.bankAccount'),
        value: 'cuenta-bancaria'
      },
      {
        label: t('salesFlow.cashBalance'),
        value: 'saldo-caja'
      }
    ];
  }, [goal, t]);

  const assetSections = [
    {
      title: t('salesFlow.quickOptions'),
      assets: [
        {
          id: 'portfolio-completo',
          title: t('salesFlow.mockActivos.option2'),
          subtitle: 'PORTFOLIO-COMPLETO',
          description: t('salesFlow.mockActivos.description2'),
          value: 4869638,
        },
        {
          id: 'retiro-proporcional',
          title: t('salesFlow.mockActivos.option3'),
          subtitle: 'RETIRO-PROPORCIONAL',
          description: t('salesFlow.mockActivos.description3'),
          value: 0,
        },
      ],
    },
    {
      title: t('salesFlow.individualFunds'),
      assets: [
        {
          id: 'marketplus-emergente',
          title: 'MarketPlus Emergente',
          subtitle: 'CFIBMPEM-E',
          additionalInfo: `${t('salesFlow.availableShares')}: 493,0`,
          value: 893358,
        },
        {
          id: 'fondo-conservador',
          title: 'Fondo Conservador Plus',
          subtitle: 'FCP-CONSERVADOR',
          additionalInfo: `${t('salesFlow.availableShares')}: 1.250,5`,
          value: 1250000,
        },
        {
          id: 'fondo-agresivo',
          title: 'Fondo Agresivo Growth',
          subtitle: 'FAG-GROWTH',
          additionalInfo: `${t('salesFlow.availableShares')}: 750,2`,
          value: 2750000,
        },
      ],
    },
  ];

  const activos: { label: string; value: string }[] = [];
  const cuentas: { label: string; value: string }[] = [];

  // Mock bank accounts for cash sales
  const bankAccounts: { label: string; value: string }[] = [
    {
      label: "Banco Estado - ****1234",
      value: "banco-estado-1234"
    },
    {
      label: "Banco Santander - ****5678",
      value: "banco-santander-5678"
    },
    {
      label: "Banco de Chile - ****9012",
      value: "banco-chile-9012"
    }
  ];

  const handleGoalChange = (newGoal: string) => {
    setGoal(newGoal);
    if (newGoal === 'cash-balance') {
      setDestino(undefined);
    }
  };

  const handleCancel = () => {
    try {
      router.push('/(tabs)/investment/portfolio')
    } catch (error) {
      console.error('handleCancel: Navigation error:', error);
    }
  };

  return (
    <Container variant="secondaryPage" className="px-1 flex-1">
      
      {step === 1 && (
        <FromGoalStep
          goal={goal}
          setGoal={handleGoalChange}
          destino={destino}
          setDestino={setDestino}
          goals={goals}
          destinos={destinos}
          onNext={() => setStep(2)}
          onCancel={handleCancel}
        />
      )}
      
      {step === 2 && (
        <FromAssetStep
          activo={activo}
          setActivo={setActivo}
          destino={destino}
          cuenta={cuenta}
          setCuenta={setCuenta}
          assetAmount={assetAmount}
          setAssetAmount={setAssetAmount}
          assetBankAccount={assetBankAccount}
          setAssetBankAccount={setAssetBankAccount}
          bankAccounts={bankAccounts}
          goalId={goal || ''}
          activos={activos}
          cuentas={cuentas}
          onNext={() => setStep(3)}
          onPrev={() => setStep(1)}
        />
      )}
      
      {step === 3 && (
        <ConfirmationStep
          activo={activo}
          activos={activos}
          destino={destino}
          goal={goal}
          cashAmount={cashAmount}
          setCashAmount={setCashAmount}
          cashBankAccount={cashBankAccount}
          setCashBankAccount={setCashBankAccount}
          bankAccounts={bankAccounts}
          onPrev={() => setStep(2)}
          onFinish={() => router.push('/(tabs)/investment/portfolio')}
        />
      )}
    </Container>
  );
}
