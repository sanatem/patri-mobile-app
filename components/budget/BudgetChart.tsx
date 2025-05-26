import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';

// In a real app, we would use a charting library like react-native-svg-charts
// For simplicity, we're creating a simplified mockup of the chart

const BudgetChart: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.donutContainer}>
        <View style={styles.donutBg}>
          <View style={styles.donutSegmentHousing} />
          <View style={styles.donutSegmentTransport} />
          <View style={styles.donutSegmentLeisure} />
          <View style={styles.donutInner}>
            <Text style={styles.totalAmount}>$568.315</Text>
            <Text style={styles.remainingText}>restante de $1.525.997</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 220,
  },
  donutContainer: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutBg: {
    width: '100%',
    height: '100%',
    borderRadius: 110,
    backgroundColor: Colors.gray[100],
    position: 'relative',
    overflow: 'hidden',
  },
  donutSegmentHousing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderWidth: 20,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.secondary[500],
    borderLeftColor: Colors.secondary[500],
    borderRadius: 110,
    transform: [{ rotate: '-45deg' }],
  },
  donutSegmentTransport: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderWidth: 20,
    borderTopColor: '#3B82F6',
    borderRightColor: '#3B82F6',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRadius: 110,
    transform: [{ rotate: '-45deg' }],
  },
  donutSegmentLeisure: {
    position: 'absolute',
    width: '60%',
    height: '60%',
    right: 0,
    bottom: 55,
    borderWidth: 20,
    borderTopColor: '#EC4899',
    borderRightColor: '#EC4899',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRadius: 70,
    transform: [{ rotate: '65deg' }],
  },
  donutInner: {
    position: 'absolute',
    width: '70%',
    height: '70%',
    borderRadius: 100,
    backgroundColor: 'white',
    top: '15%',
    left: '15%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalAmount: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: Colors.gray[900],
  },
  remainingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.gray[500],
    textAlign: 'center',
    marginTop: 4,
  },
});

export default BudgetChart;