import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Container } from '@/components/ui/Container';
import FormLayout from '@/components/ui/FormLayout';
import Colors from '@/constants/Colors';
import FromGoalStep from './from-goal-step';
import FromAssetStep from './from-asset-step';
import ConfirmationStep from './confirmation-step';
import CashSaleForm from '@/components/investment/PortfolioOverview/Movements/MovementsForms/sales/CashSaleForm';
import { useTranslation } from 'react-i18next';
import { useGoals } from '@/hooks/investment/useGoals';
import { useFormatValue } from '@/hooks/common/useFormatValue';
import { useAuth } from '@/providers/AuthProvider';
import { getCash } from '@/services/investment/cash/get-cash';
import { getBankAccounts, type BankAccount } from '@/services/investment/bank-accounts/get-bank-account';
import { getPortfolioDetails } from '@/services/investment/portfolio/portfolio-details/get-portfolio-details';
import type { Goal } from '@/types/api';
import type { Cash } from '@/services/investment/cash/get-cash';

export default function SalesFlow() {
  const { t } = useTranslation();
  const { goals: goalsData, loading: goalsLoading } = useGoals();
  const { formatValue } = useFormatValue();
  const { accessToken } = useAuth();
  const { goalId } = useLocalSearchParams<{ goalId?: string }>();
  const [cashData, setCashData] = useState<Cash | null>(null);
  const [bankAccounts, setBankAccounts] = useState<{ label: string; value: string }[]>([]);
  const [loadingBankAccounts, setLoadingBankAccounts] = useState(false);
  const [goalsAvailableValues, setGoalsAvailableValues] = useState<Record<string, number>>({});

  const router = useRouter();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<string | undefined>(goalId);
  const [destino, setDestino] = useState<string | undefined>();
  const [activo, setActivo] = useState<string | undefined>();
  const [cuenta, setCuenta] = useState<string | undefined>();
  const [cashAmount, setCashAmount] = useState<string>('');
  const [cashBankAccount, setCashBankAccount] = useState<string | undefined>();
  const [assetAmount, setAssetAmount] = useState<string>('');
  const [assetBankAccount, setAssetBankAccount] = useState<string | undefined>();

  // Actualizar goal cuando cambie goalId en los parámetros
  useEffect(() => {
    if (goalId) {
      setGoal(goalId);
    }
  }, [goalId]);

  useEffect(() => {
    const loadData = async () => {
      if (!accessToken) return;

      try {
        const cashResponse = await getCash(accessToken);
        setCashData(cashResponse?.cash?.investment || cashResponse?.cash?.savings || null);

        setLoadingBankAccounts(true);
        const bankResponse = await getBankAccounts(accessToken);

        if (bankResponse.success) {
      
          const defaultAccount = bankResponse.accounts.find(account => account.is_default);

          if (defaultAccount) {
            const formattedAccounts = [{
              label: defaultAccount.label,
              value: defaultAccount.value
            }];
            setBankAccounts(formattedAccounts);
        
            setCashBankAccount(defaultAccount.value);
            setAssetBankAccount(defaultAccount.value);
          } else {
            console.warn('SalesFlow: No default bank account found');
            setBankAccounts([]);
          }
        } else {
          console.error('SalesFlow: Error loading bank accounts:', bankResponse.message);
          setBankAccounts([]);
        }
      } catch (error) {
        console.error('SalesFlow: Error loading data:', error);
        setBankAccounts([]);
      } finally {
        setLoadingBankAccounts(false);
      }
    };

    loadData();
  }, [accessToken]);

  useEffect(() => {
    const loadGoalsAvailableValues = async () => {
      if (!accessToken || goalsLoading) return;

      const allGoals: Goal[] = [
        ...goalsData.investment.shortTerm,
        ...goalsData.investment.mediumTerm,
        ...goalsData.investment.longTerm,
        ...goalsData.savings.shortTerm,
        ...goalsData.savings.mediumTerm,
        ...goalsData.savings.longTerm,
      ];

      const valuesMap: Record<string, number> = {};

      await Promise.all(
        allGoals.map(async (goal) => {
          try {
            const details = await getPortfolioDetails(goal.id, accessToken);
            if (details?.assets) {
              const totalAvailable = details.assets.reduce((sum, asset) => sum + (asset.value || 0), 0);
              valuesMap[goal.id] = totalAvailable;
            }
          } catch (error) {
            console.error(`Error loading details for goal ${goal.id}:`, error);
            valuesMap[goal.id] = goal.goalWallet ?? goal.currentAmount ?? 0;
          }
        })
      );

      setGoalsAvailableValues(valuesMap);
    };

    loadGoalsAvailableValues();
  }, [accessToken, goalsData, goalsLoading]);


  const goals = useMemo(() => {
    const allGoals: Goal[] = [
      ...goalsData.investment.shortTerm,
      ...goalsData.investment.mediumTerm,
      ...goalsData.investment.longTerm,
      ...goalsData.savings.shortTerm,
      ...goalsData.savings.mediumTerm,
      ...goalsData.savings.longTerm,
    ];

    const goalOptions = allGoals
      .filter(goal => {
        const amount = goalsAvailableValues[goal.id] ?? 0;
        return amount > 0;
      })
      .map(goal => {
        const amount = goalsAvailableValues[goal.id] ?? 0;
        return {
          label: `${goal.name} (${formatValue(String(amount))})`,
          value: goal.id
        };
      });

    if (cashData) {
      const availableAmount = typeof cashData.available_amount === 'string'
        ? parseFloat(cashData.available_amount)
        : cashData.available_amount;

      goalOptions.push({
        label: `${t('salesFlow.cashBalance')} (${formatValue(String(availableAmount))})`,
        value: 'cash-balance'
      });
    } else {
      goalOptions.push({
        label: t('salesFlow.cashBalance'),
        value: 'cash-balance'
      });
    }

    return goalOptions;
  }, [goalsData, formatValue, t, cashData, goalsAvailableValues]);

  const destinos = useMemo(() => {
    if (!goal || goal === 'cash-balance') {
      return [];
    }

    return [
      {
        label: t('salesFlow.bankAccount'),
        value: 'bank-account'
      },
      {
        label: t('salesFlow.cashBalance'),
        value: 'cash-balance'
      }
    ];
  }, [goal, t]);

  const assetSections = [
    {
      title: t('salesFlow.quickOptions'),
      assets: [
        {
          id: 'all-portfolio',
          title: t('salesFlow.allPortfolio'),
          subtitle: '',
          description: t('salesFlow.sellAllShares'),
          value: 0,
        },
        {
          id: 'proportional-withdrawal',
          title: t('salesFlow.proportionalWithdrawal'),
          subtitle: '',
          description: t('salesFlow.maintainStructure'),
          value: 0,
        },
      ],
    },
    {
      title: t('salesFlow.individualFunds'),
      assets: [],
    },
  ];

  const assetMap = useMemo(() => {
    const map: Record<string, { label: string; value: string }> = {};
    assetSections.forEach(section => {
      section.assets.forEach(asset => {
        map[asset.id] = {
          label: asset.title,
          value: asset.id
        };
      });
    });
    return map;
  }, [assetSections]);

  const activos: { label: string; value: string }[] = [
    {
      label: t('salesFlow.allPortfolio'),
      value: 'all-portfolio'
    },
    {
      label: t('salesFlow.proportionalWithdrawal'),
      value: 'proportional-withdrawal'
    },
    ...assetSections.flatMap(section =>
      section.assets.map(asset => ({
        label: asset.title,
        value: asset.id
      }))
    )
  ];
  const cuentas: { label: string; value: string }[] = [];

  const hasGoalsWithBalance = useMemo(() => {
    const allGoals: Goal[] = [
      ...goalsData.investment.shortTerm,
      ...goalsData.investment.mediumTerm,
      ...goalsData.investment.longTerm,
      ...goalsData.savings.shortTerm,
      ...goalsData.savings.mediumTerm,
      ...goalsData.savings.longTerm,
    ];

    return allGoals.some(goal => {
      const amount = goal.availableValueForRetirement ?? goal.goalWallet ?? goal.currentAmount ?? 0;
      return amount > 0;
    });
  }, [goalsData]);

  const cashBalance = useMemo(() => {
    if (!cashData) return 0;
    const availableAmount = typeof cashData.available_amount === 'string'
      ? parseFloat(cashData.available_amount)
      : cashData.available_amount;
    return availableAmount || 0;
  }, [cashData]);

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
          cashBalance={cashBalance}
          hasGoalsWithBalance={hasGoalsWithBalance}
          onNext={() => goal === 'cash-balance' ? setStep(2) : setStep(2)}
          onCancel={handleCancel}
        />
      )}
      
      {step === 2 && goal === 'cash-balance' && (
        <FormLayout
          title={t('salesFlow.cashSale.title')}
          subtitle={t('salesFlow.cashSale.subtitle')}
          currentStep={2}
          totalSteps={3}
          onNext={() => setStep(3)}
          onPrevious={() => setStep(1)}
          nextButtonTitle={t('salesFlow.next')}
          previousButtonTitle={t('salesFlow.previous')}
          isNextDisabled={!cashAmount || !cashBankAccount || loadingBankAccounts}
          showLogo={false}
        >
          <CashSaleForm
            amount={cashAmount}
            setAmount={setCashAmount}
            bankAccount={cashBankAccount}
            setBankAccount={setCashBankAccount}
            bankAccounts={bankAccounts}
          />
        </FormLayout>
      )}

      {step === 2 && goal !== 'cash-balance' && (
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
          loadingBankAccounts={loadingBankAccounts}
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
          goalOptions={goals}
          assetAmount={assetAmount}
          assetBankAccount={assetBankAccount}
          cashAmount={cashAmount}
          setCashAmount={setCashAmount}
          cashBankAccount={cashBankAccount}
          setCashBankAccount={setCashBankAccount}
          bankAccounts={bankAccounts}
          assetSections={assetSections}
          onPrev={() => setStep(2)}
          onFinish={() => {
            try {
              router.push('/(tabs)/investment/portfolio');
            } catch (error) {
              console.error('Portfolio navigation error:', error);
            }
          }}
        />
      )}
    </Container>
  );
}
