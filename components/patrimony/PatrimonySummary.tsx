import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { ChevronDown, TrendingUp, TrendingDown } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useNetworth } from '@/hooks/patrimony/useNetworth';
import { useNetworthHistoric } from '@/hooks/patrimony/useNetworthHistoric';

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

  // ✅ USAR HOOKS PARA OBTENER DATOS REALES
  const { networthData, loading, error } = useNetworth();
  const { historicData, loading: historicLoading } = useNetworthHistoric(); // Sin filtros para obtener variación del último mes

  const formatCurrency = (amount: number) => {
    return `$${Math.abs(amount).toLocaleString('es-CL')}`;
  };

  const formatVariation = (amount: number) => {
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
    displayData = {
      totalNetWorth: networthData.networth.networth_value,
      totalAssets: networthData.networth.total_assets,
      totalLiabilities: networthData.networth.total_debts,
    };
  } else {
    displayData = {
      totalNetWorth,
      totalAssets,
      totalLiabilities,
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
          Patrimonio Neto
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
                  Activos
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
                  Pasivos
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
            vs último mes
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