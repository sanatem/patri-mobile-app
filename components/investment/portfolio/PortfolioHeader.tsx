import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import { useCash } from '@/hooks/patrimony/useCash';
import { ChevronDown } from 'lucide-react-native';
import { SkeletonBase } from '@/components/ui/SkeletonBase';

interface PortfolioHeaderProps {
  patrimony: string;
  isLoading?: boolean;
}

export function PortfolioHeader({ patrimony, isLoading }: PortfolioHeaderProps) {
  const { cashData, loading: cashLoading, error } = useCash();
  const [isExpanded, setIsExpanded] = useState(false);
  const [rotateAnim] = useState(new Animated.Value(0));

  // Show skeleton when loading
  if (isLoading) {
    return (
      <View style={styles.card}>
        <SkeletonBase
          width={120}
          height={16}
          x={0}
          y={0}
          rows={1}
          rowHeight={16}
          rowWidth={120}
          borderRadius={4}
          style={{ marginBottom: 8 }}
        />
        <View style={styles.headerContainer}>
          <SkeletonBase
            width={200}
            height={32}
            x={0}
            y={0}
            rows={1}
            rowHeight={32}
            rowWidth={200}
            borderRadius={4}
            style={{ marginRight: 8 }}
          />
          <SkeletonBase
            width={24}
            height={24}
            x={0}
            y={0}
            rows={1}
            rowHeight={24}
            rowWidth={24}
            borderRadius={12}
          />
        </View>
      </View>
    );
  }

  const getCashDisplayValue = () => {
    if (cashLoading) {
      return null;
    }
    if (error || !cashData) {
      return '$0';
    }
    return `${Math.floor(cashData.cash.total_amount).toLocaleString('es-CL')}`;
  };

  const cashDisplayValue = getCashDisplayValue();

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

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Patrimonio Neto</Text>
      <TouchableOpacity onPress={toggleExpanded} style={styles.headerContainer} activeOpacity={0.8}>
        <Text style={styles.amount}>${patrimony}</Text>
        <Animated.View style={[rotateStyle]}>
          <ChevronDown size={24} color={Colors.primary[500]} />
        </Animated.View>
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.expandedContainer}>
          <View style={styles.rowContainer}>
            <Text style={styles.subtitle}>Saldo en caja</Text>
            <Text style={styles.cashAmount}>${cashDisplayValue}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
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
    marginBottom: 4,
  },
  amount: {
    fontSize: 32,
    fontFamily: 'Poppins-Medium',
    color: Colors.primary[700],
    marginRight: 8,
  },
  expandedContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: Colors.gray[600],
    marginBottom: 4,
  },
  cashAmount: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: Colors.primary[600],
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});