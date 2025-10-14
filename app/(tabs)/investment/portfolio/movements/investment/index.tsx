import { useState } from 'react';
import { Keyboard, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '@/components/ui/Container';
import GoalSelectionStep from './goal-step';
import SourceFundsStep from './source-funds-step';
import { FintocTransfer } from '@/components/investment/movements/investment/source-funds';
import { useCash } from '@/hooks/cash/useCash';
import { useCreatePurchase } from '@/hooks/investment/useCreatePurchase';
import { useGoals } from '@/hooks/investment/useGoals';
import { useBrokerPortfolioDetails } from '@/hooks/investment/useBrokerPortfolioDetails';
import { useAuth } from '@/providers/AuthProvider';
import { useTranslation } from 'react-i18next';

type Step = 'goal-step' | 'source-funds-step';

export default function InvestmentMovementFlow() {
  const { t } = useTranslation();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('goal-step')
  const [selectedGoal, setSelectedGoal] = useState('')
  const [amount, setAmount] = useState('')
  const [selectedSource, setSelectedSource] = useState('')
  const [fintocConfig, setFintocConfig] = useState<{
    widget_token: string;
    public_key: string;
    webhook_url: string;
  } | null>(null);
  const [showFintocWidget, setShowFintocWidget] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const { cash } = useCash();
  const { goals } = useGoals();
  const { createPurchase, loading: purchaseLoading } = useCreatePurchase();
  const { brokerPortfolio } = useBrokerPortfolioDetails({ goalId: selectedGoal });
  const { user } = useAuth();

  const availableCashAmount = cash?.cash?.investment?.available_amount 
    ? parseFloat(cash.cash.investment.available_amount.toString()) 
    : 0;

  const handleGoalStepContinue = () => {
    setCurrentStep('source-funds-step')
  };

  const handleSourceStepPrevious = () => {
    setCurrentStep('goal-step')
  };

  const handleFinish = async () => {
    try {
      if (!user?.backendUserId || !selectedGoal || !amount || !selectedSource) {;
        return;
      }

      if (selectedSource === 'fintoc') {
        await handleConfirm('fintoc')
        return;
      }

      setIsSubmitting(true);

      const accountInfo = goals.investment.accountInfo;
      if (!accountInfo) {
        throw new Error('No se encontró información de la cuenta de inversión')
      }

      if (!brokerPortfolio?.id) {
        throw new Error('No existe un portafolio asociado a la meta')
      }

      const purchaseData = {
        type: selectedSource === 'cash' ? 'opening' as const : 'deposit_intention' as const,
        user_id: user.backendUserId,
        goal_id: parseInt(selectedGoal),
        investment_account_id: accountInfo.id,
        broker_portfolio_id: brokerPortfolio.id,
        amount: parseFloat(amount),
        source: selectedSource,
      };

      await Promise.all([
        createPurchase(purchaseData),
        new Promise(resolve => setTimeout(resolve, 1000))
      ]);

      setIsSubmitting(false);
      setIsSaved(true);

      setTimeout(() => {
        try {
          Keyboard.dismiss();
          router.push('/(tabs)/investment/portfolio');
        } catch (error) {
          console.error('Navigation error:', error);
        }
      }, 2000);

    } catch (error) {
      console.error('Error al crear la compra:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Ocurrió un error al crear la compra'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirm = async (source: string) => {
    try {

      if (!user?.backendUserId || !selectedGoal || !amount) {
        return;
      }

      setIsSubmitting(true);

      const accountInfo = goals.investment.accountInfo;
      if (!accountInfo) {
        throw new Error('No se encontró información de la cuenta de inversión')
      }

      if (!brokerPortfolio?.id) {
        throw new Error('No existe un portafolio asociado a la meta')
      }

      const purchaseData = {
        type: source === 'cash' ? 'opening' as const : 'deposit_intention' as const,
        user_id: user.backendUserId,
        goal_id: parseInt(selectedGoal),
        investment_account_id: accountInfo.id,
        broker_portfolio_id: brokerPortfolio.id,
        amount: parseFloat(amount),
        source: source,
      };

      const result = await Promise.all([
        createPurchase(purchaseData),
        new Promise(resolve => setTimeout(resolve, 1000))
      ]);

      if (source === 'fintoc' && result[0]?.fintoc_widget) {
        setFintocConfig({
          widget_token: result[0].fintoc_widget.widget_token,
          public_key: result[0].fintoc_widget.fintoc_public_key,
          webhook_url: result[0].fintoc_widget.webhook_url,
        });
        setShowFintocWidget(true);
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      setIsSaved(true);

      setTimeout(() => {
        try {
          Keyboard.dismiss();
          router.push('/(tabs)/investment/portfolio');
        } catch (error) {
          console.error('Navigation error:', error);
        }
      }, 2000);

    } catch (error) {
      console.error('Error al crear el depósito:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Ocurrió un error al crear el depósito'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFintocSuccess = (data: any) => {
    setShowFintocWidget(false);
    Keyboard.dismiss();
    router.push('/(tabs)/investment/portfolio')
  };

  const handleFintocExit = () => {
    setShowFintocWidget(false);
    Keyboard.dismiss();
    router.push('/(tabs)/investment/portfolio');
  };

  const handleCancel = () => {
    try {
      router.push('/(tabs)/investment/portfolio')
    } catch (error) {
      console.error('handleCancel: Navigation error:', error);
    }
  };

  return (
    <Container variant="secondaryPage">
      {showFintocWidget && fintocConfig && (
        <FintocTransfer
          amount={parseFloat(amount)}
          onSuccess={handleFintocSuccess}
          onExit={handleFintocExit}
          fintocConfig={fintocConfig}
        />
      )}

      {!showFintocWidget && currentStep === 'goal-step' && (
        <GoalSelectionStep
          selectedGoal={selectedGoal}
          onGoalSelect={setSelectedGoal}
          amount={amount}
          onAmountChange={setAmount}
          onContinue={handleGoalStepContinue}
          onCancel={handleCancel}
        />
      )}
      
      {!showFintocWidget && currentStep === 'source-funds-step' && (
        <SourceFundsStep
          selectedSource={selectedSource}
          onSourceSelect={setSelectedSource}
          amount={parseFloat(amount) || 0}
          availableCashAmount={availableCashAmount}
          onContinue={handleFinish}
          onConfirm={handleConfirm}
          onPrevious={handleSourceStepPrevious}
          loading={purchaseLoading}
          isSubmitting={isSubmitting}
          isSaved={isSaved}
        />
      )}
    </Container>
  );
} 