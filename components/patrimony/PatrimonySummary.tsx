import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { ChevronDown, TrendingUp, TrendingDown } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useNetworth } from '@/hooks/patrimony/useNetworth';
import { useNetworthHistoric } from '@/hooks/patrimony/useNetworthHistoric';
import { SkeletonBase } from '@/components/ui/SkeletonBase';
import { useTranslation } from 'react-i18next';

interface PatrimonySummaryProps {
  totalNetWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  variation: number;
  variationPercentage: number;
  currentView: 'mine' | 'partner' | 'both';
}

export function PatrimonySummary({
  totalNetWorth,
  totalAssets,
  totalLiabilities,
  variation,
  variationPercentage,
  currentView
}: PatrimonySummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [rotateAnim] = useState(new Animated.Value(0));
  const [showContent, setShowContent] = useState(false);
  const { t } = useTranslation();

  const { networthData, loading, error } = useNetworth();
  const { historicData, loading: historicLoading } = useNetworthHistoric();

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 3000);
    return () => clearTimeout(timer);
  }, []); 
  if (loading || historicLoading || !showContent) {
    return (
      <View style={[styles.gradient, { alignItems: 'center', justifyContent: 'center' }]}> 
        <View style={{
          backgroundColor: 'white',
          borderRadius: 24,
          padding: 24,
          width: 375,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.10,
          shadowRadius: 24,
          elevation: 10,
        }}>
          <SkeletonBase
            rows={3}
            rowHeight={24}
            rowWidth={i => (i === 0 ? 250 : i === 1 ? 160 : 130)}
            height={120}
            width={300}
            x={20}
            y={20}
          />
        </View>
      </View>
    );
  }

  const formatCurrency = (amount: number) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '$0';
    }
    return `$${Math.abs(amount).toLocaleString('es-CL')}`;
  };

  const formatVariation = (amount: number) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '$0';
    }
    const sign = amount >= 0 ? '+' : '-';
    return `${sign}$${Math.abs(Math.round(amount)).toLocaleString('es-CL')}`;
  };

  const toggleExpanded = () => {
    const toValue = isExpanded ? 0 : 1;
    
    Animated.timing(rotateAnim, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
    
    setIsExpanded(!isExpanded);
  };

  const rotateStyle = {
    transform: [
      {
        rotate: rotateAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
  };

  let displayData;
  if (networthData && !error && !loading) {
    console.log('🔍 Using API data:', {
      patrimony_value: networthData.networth.patrimony_value,
      total_assets: networthData.networth.total_assets,
      total_debts: networthData.networth.total_debts,
    });
    displayData = {
      totalNetWorth: Number(networthData.networth.patrimony_value) || 0,
      totalAssets: Number(networthData.networth.total_assets) || 0,
      totalLiabilities: Number(networthData.networth.total_debts) || 0,
    };
  } else {
    console.log('🔍 Using fallback data:', {
      totalNetWorth,
      totalAssets,
      totalLiabilities,
      error,
      loading,
      hasNetworthData: !!networthData
    });
    displayData = {
      totalNetWorth: Number(totalNetWorth) || 0,
      totalAssets: Number(totalAssets) || 0,
      totalLiabilities: Number(totalLiabilities) || 0,
    };
  }

  let variationData;
  if (historicData && !historicLoading && 'last_month_variation' in historicData.historic.variation) {
    variationData = {
      variation: historicData.historic.variation.last_month_variation.absolute_change,
      variationPercentage: historicData.historic.variation.last_month_variation.percentage_change,
      isPositive: historicData.historic.variation.last_month_variation.trend === 'positive'
    };
  } else {
    variationData = {
      variation,
      variationPercentage,
      isPositive: variation >= 0
    };
  }

  return (
    <View style={styles.gradient}>
      <View style={styles.container}>
        <Text style={styles.title}>
          {t('patrimony.netWorthTitle')}
        </Text>
        
        <TouchableOpacity
          onPress={toggleExpanded}
          style={styles.headerContainer}
        >
          <Text style={styles.amount}>
            {formatCurrency(displayData.totalNetWorth)}
          </Text>
          
          <Animated.View style={[rotateStyle]}>
            <ChevronDown
              size={24}
              color={Colors.primary[500]}
            />
          </Animated.View>
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.expandedContainer}>
            <View style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <TrendingUp size={16} color={Colors.success[500]} />
                <Text style={styles.itemLabel}>
                  {t('patrimony.assets')}
                </Text>
              </View>
              <Text style={[styles.itemValue, { color: Colors.success[500] }]}>
                +{formatCurrency(displayData.totalAssets)}
              </Text>
            </View> 
            <View style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <TrendingDown size={16} color={Colors.error[400]} />
                <Text style={styles.itemLabel}>
                  {t('patrimony.liabilities')}
                </Text>
              </View>
              <Text style={[styles.itemValue, { color: Colors.error[400] }]}>
                -{formatCurrency(displayData.totalLiabilities)}
              </Text>
            </View>
          </View>
        )}
        
        <View style={styles.variationContainer}>
          <Text style={[
            styles.variationText,
            { color: variationData.isPositive ? Colors.success[500] : Colors.error[500] }
          ]}>
            {formatVariation(variationData.variation)} ({variationData.variationPercentage.toFixed(2)}%)
          </Text>
          <Text style={styles.comparisonText}>
            {t('patrimony.comparedToLastMonth')}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    backgroundColor: 'white',
  },
  container: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: Colors.primary[500],
    marginBottom: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  amount: {
    fontSize: 32,
    fontFamily: 'Poppins-Medium',
    color: Colors.primary[700],
    marginRight: 8,
  },
  expandedContainer: {
    width: '100%',
    paddingHorizontal: 90,
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: Colors.primary[500],
    marginLeft: 8,
  },
  itemValue: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  variationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  variationText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginRight: 4,
  },
  comparisonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: Colors.gray[500],
  },
});