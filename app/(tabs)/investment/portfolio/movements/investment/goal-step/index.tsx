import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, ScrollView, Animated } from 'react-native';
import FormLayout from '@/components/ui/FormLayout';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useFormatValue } from '@/hooks/common/useFormatValue';
import { useGoals } from '@/hooks/investment/useGoals';
import { useBrokerPortfolioDetails } from '@/hooks/investment/useBrokerPortfolioDetails';
import { useCreatePurchase } from '@/hooks/investment/useCreatePurchase';
import { useAuth } from '@/providers/AuthProvider';
import { useTranslation } from 'react-i18next';
import { selectStyles, SCREEN_HEIGHT } from '@/styles/ui/Select.styles';
import Colors from '@/constants/Colors';
import { PieChart } from 'lucide-react-native';

interface GoalSelectionStepProps {
  selectedGoal?: string;
  onGoalSelect?: (goal: string) => void;
  amount?: string;
  onAmountChange?: (amount: string) => void;
  onContinue?: () => void;
  onCancel?: () => void;
}

export default function GoalSelectionStep({
  selectedGoal: initialGoal = '',
  onGoalSelect,
  amount = '',
  onAmountChange,
  onContinue,
  onCancel,
}: GoalSelectionStepProps) {
  const [selectedGoal, setSelectedGoal] = useState(initialGoal);
  const [displayValue, setDisplayValue] = useState('')
  const [selectedPortfolio, setSelectedPortfolio] = useState('')
  const [isPortfolioModalVisible, setIsPortfolioModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const sheetAnim = useRef(new Animated.Value(0)).current;
  const { formatValue, cleanNumericValue } = useFormatValue();
  const { goals, loading: goalsLoading, error: goalsError } = useGoals();
  const { createPurchase, loading: purchaseLoading, error: purchaseError } = useCreatePurchase();
  const { user } = useAuth();

  const { brokerPortfolio, loading: portfolioLoading } = useBrokerPortfolioDetails({
    goalId: selectedGoal || undefined,
  });


  const { t } = useTranslation();

  // Función para mapear el perfil de riesgo
  const getRiskProfileDisplayName = (riskProfile: string | null | undefined): string => {
    switch (riskProfile) {
      case 'risky':
        return 'Arriesgado';
      case 'conservative':
        return 'Conservador';
      case 'moderate':
        return 'Balanceado';
      case null:
      case undefined:
        return 'Sin perfil de riesgo';
      default:
        return 'Sin perfil de riesgo';
    }
  };

  const goalOptions = useMemo(() => {
    const allGoals = [
      ...goals.investment.shortTerm,
      ...goals.investment.mediumTerm,
      ...goals.investment.longTerm,
    ];
    
    return allGoals.map(goal => ({
      label: goal.name,
      value: goal.id,
    }));
  }, [goals]);

  useEffect(() => {
    if (amount) {
      setDisplayValue(formatValue(amount));
    } else {
      setDisplayValue('')
    }
  }, [amount, formatValue]);

  useEffect(() => {
    if (isPortfolioModalVisible) {
      setModalVisible(true);
      Animated.parallel([
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(sheetAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (modalVisible) {
      Animated.parallel([
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(sheetAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setModalVisible(false);
      });
    }
  }, [isPortfolioModalVisible]);

  const handleGoalSelect = (goal: string) => {
    setSelectedGoal(goal);
    if (onGoalSelect) {
      onGoalSelect(goal);
    }
  };

  const handleAmountChange = (text: string) => {
    const clean = cleanNumericValue(text);
    
    if (clean) {
      setDisplayValue(formatValue(clean));
      if (onAmountChange) {
        onAmountChange(clean);
      }
    } else {
      setDisplayValue('')
      if (onAmountChange) {
        onAmountChange('')
      }
    }
  };

  const MINIMUM_DEPOSIT_AMOUNT = 10000;
  const currentAmount = parseFloat(amount) || 0;

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    }
  };

  const handlePortfolioLinkPress = () => {
    setIsPortfolioModalVisible(true);
  };

  const closeModal = () => {
    setIsPortfolioModalVisible(false);
  };

  return (
    <FormLayout
      title={t('investmentMovement.goalStep.title')}
      subtitle=""
      currentStep={1}
      totalSteps={2}
      onNext={handleContinue}
      onCancel={onCancel}
      nextButtonTitle={t('common.continue')}
      cancelButtonTitle={t('common.cancel')}
      isNextDisabled={!selectedGoal || !amount || currentAmount < MINIMUM_DEPOSIT_AMOUNT}
      showLogo={false}
    >
      <Select
        label={t('fromGoalStep.metaTo.part2')}
        options={goalOptions}
        value={selectedGoal}
        onSelect={handleGoalSelect}
        placeholder={t('fromGoalStep.goalPlaceholder')}
      />

      {selectedGoal && (
        <View style={{ marginTop: -20 }}>
          <TouchableOpacity
            onPress={handlePortfolioLinkPress}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderWidth: 1,
              borderColor: Colors.primary[200],
              borderRadius: 12,
              backgroundColor: 'white',
            }}
            activeOpacity={0.7}
          >
            <PieChart size={14} color={Colors.primary[500]} style={{ marginRight: 6 }} />
            <Text className="text-xs font-medium" style={{ color: Colors.primary[500] }}>
              {t('investmentMovement.goalStep.portfolioInfo.label')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View>
        <Input
          label={t('amountStep.title')}
          value={displayValue}
          onChangeText={handleAmountChange}
          keyboardType="number-pad"
          placeholder={t('amountStep.placeholder')}
          maxLength={18}
          error={currentAmount > 0 && currentAmount < MINIMUM_DEPOSIT_AMOUNT ? `Monto mínimo: ${formatValue(MINIMUM_DEPOSIT_AMOUNT.toString())}` : undefined}
        />
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={closeModal}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Animated.View style={[
            selectStyles.overlay,
            {
              backgroundColor: 'black',
              opacity: overlayAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.45],
              }),
            },
          ]}>
            <Pressable style={{ flex: 1 }} onPress={closeModal} />
          </Animated.View>
          <Animated.View style={[
            selectStyles.modalSheet,
            {
              transform: [
                {
                  translateY: sheetAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [SCREEN_HEIGHT, 0],
                  }),
                },
              ],
            },
          ]}>
            <View style={selectStyles.dragIndicatorContainer}>
              <View style={selectStyles.dragIndicator} />
            </View>
            
            <Text className="text-base font-medium mb-4" style={{ color: Colors.primary[500] }}>
              {brokerPortfolio?.name || ''}
            </Text>
            
            <ScrollView 
              style={{ maxHeight: 400 }}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {brokerPortfolio && (
                <View style={{ marginBottom: 20 }}>
                  <View style={{ 
                    backgroundColor: Colors.gray[50], 
                    padding: 16, 
                    borderRadius: 12,
                    marginBottom: 16
                  }}>
                      <View>
                        <Text className="text-sm font-regular" style={{ color: Colors.primary[600] }}>
                          <Text className="font-medium">Perfil de riesgo:</Text> {getRiskProfileDisplayName(brokerPortfolio.risk_profile)}
                        </Text>
                      </View>
                  </View>
                  
                  <View style={{ 
                    backgroundColor: Colors.gray[50], 
                    padding: 16, 
                    borderRadius: 12 
                  }}>
                    <Text className=" text-sm font-medium mb-4" style={{ color: Colors.primary[700] }}>
                      Composición:
                    </Text>
                    {brokerPortfolio.composition.map((item, index) => (
                      <View key={index} style={{ 
                        flexDirection: 'row', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: index < brokerPortfolio.composition.length - 1 ? 12 : 0
                      }}>
                        <Text className="text-sm font-regular" style={{ color: Colors.primary[600] }}>
                          {item.product_code}
                        </Text>
                        <Text className="text-sm font-medium" style={{ color: Colors.primary[700] }}>
                          {item.percentage}%
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              
              {!brokerPortfolio && !portfolioLoading && selectedGoal && (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text className="text-base font-medium mb-2" style={{ color: Colors.primary[700] }}>
                    Sin portafolio recomendado
                  </Text>
                  <Text className="text-sm font-regular text-center" style={{ color: Colors.primary[600] }}>
                    Esta meta no tiene un portafolio recomendado asociado
                  </Text>
                </View>
              )}
              
              {!brokerPortfolio && !portfolioLoading && !selectedGoal && (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text className="text-sm font-regular text-center" style={{ color: Colors.primary[600] }}>
                    Selecciona una meta para ver el portafolio recomendado
                  </Text>
                </View>
              )}
              
              {portfolioLoading && (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text className="text-sm font-regular" style={{ color: Colors.primary[600] }}>
                    Cargando información del portafolio...
                  </Text>
                </View>
              )}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </FormLayout>
  );
} 