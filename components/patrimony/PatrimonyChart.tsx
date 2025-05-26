import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Colors from '@/constants/Colors';

// In a real app, we would use a charting library like react-native-svg-charts
// For simplicity, we're creating a simplified mockup of the chart

interface PatrimonyChartProps {
  selectedTimeRange: string;
}

const PatrimonyChart: React.FC<PatrimonyChartProps> = ({ selectedTimeRange }) => {
  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <View style={styles.chartBackground}>
          <View style={styles.chartLine} />
          <View style={styles.chartLine} />
          <View style={styles.chartLine} />
          <View style={styles.chartLine} />
        </View>
        
        <View style={styles.chartAreaContainer}>
          <View style={styles.chartArea} />
        </View>
        
        <View style={styles.dataPointContainer}>
          <View style={styles.dataPoint}>
            <View style={styles.dataPointInner} />
          </View>
          
          <View style={styles.dataLabel}>
            <Text style={styles.dataDate}>21 de marzo, 2025</Text>
            <Text style={styles.dataValue}>$17.035.276 CLP</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.timeLabelsContainer}>
        <Text style={styles.timeLabel}>13 de noviembre, 2024</Text>
        <Text style={styles.timeLabel}>13 de mayo, 2025</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    width: '100%',
  },
  chartContainer: {
    flex: 1,
    position: 'relative',
  },
  chartBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  chartLine: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.gray[200],
  },
  chartAreaContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 30,
  },
  chartArea: {
    height: '100%',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderTopWidth: 2,
    borderColor: '#22C55E',
  },
  dataPointContainer: {
    position: 'absolute',
    top: 40,
    right: '25%',
    alignItems: 'center',
  },
  dataPoint: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dataPointInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  dataLabel: {
    position: 'absolute',
    top: -50,
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dataDate: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.gray[500],
  },
  dataValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: Colors.gray[900],
  },
  timeLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.gray[500],
  },
});

export default PatrimonyChart;