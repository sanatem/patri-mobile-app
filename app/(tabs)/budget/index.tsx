import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import BudgetChart from '@/components/budget/BudgetChart';
import TransactionsList from '@/components/budget/TransactionsList';

const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function BudgetScreen() {
  const [selectedMonth, setSelectedMonth] = useState('Enero');
  const [activeTab, setActiveTab] = useState('income');

  const handlePreviousMonth = () => {
    const currentIndex = months.indexOf(selectedMonth);
    if (currentIndex > 0) {
      setSelectedMonth(months[currentIndex - 1]);
    } else {
      setSelectedMonth(months[months.length - 1]);
    }
  };

  const handleNextMonth = () => {
    const currentIndex = months.indexOf(selectedMonth);
    if (currentIndex < months.length - 1) {
      setSelectedMonth(months[currentIndex + 1]);
    } else {
      setSelectedMonth(months[0]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Presupuestos</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.budgetCard}>
          <View style={styles.monthSelector}>
            <TouchableOpacity onPress={handlePreviousMonth}>
              <ChevronLeft size={24} color={Colors.gray[700]} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.monthButton}>
              <Text style={styles.monthText}>{selectedMonth}</Text>
              <ChevronRight size={16} color={Colors.gray[500]} style={{ transform: [{ rotate: '90deg' }] }} />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleNextMonth}>
              <ChevronRight size={24} color={Colors.gray[700]} />
            </TouchableOpacity>
          </View>

          <BudgetChart />
          
          <View style={styles.budgetLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: Colors.secondary[500] }]} />
              <Text style={styles.legendText}>Vivienda</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.legendText}>Transporte</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#EC4899' }]} />
              <Text style={styles.legendText}>Ocio</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#06B6D4' }]} />
              <Text style={styles.legendText}>Salud</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>Servicios</Text>
            </View>
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'income' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('income')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'income' && styles.activeTabText,
              ]}
            >
              Ingresos <Text style={styles.tabCount}>6</Text>
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'expenses' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('expenses')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'expenses' && styles.activeTabText,
              ]}
            >
              Gastos <Text style={styles.tabCount}>62</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.gray[400]} style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>
            Buscar en {activeTab === 'income' ? 'ingresos' : 'gastos'}
          </Text>
        </View>

        <TransactionsList type={activeTab} />

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.gray[800],
  },
  scrollView: {
    flex: 1,
  },
  budgetCard: {
    padding: 16,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  monthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  monthText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.gray[800],
    marginRight: 4,
  },
  budgetLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginBottom: 10,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: Colors.gray[700],
    lineHeight: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
    marginTop: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary[500],
  },
  tabText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.gray[500],
  },
  activeTabText: {
    color: Colors.primary[500],
  },
  tabCount: {
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 12,
    color: Colors.gray[600],
    marginLeft: 6,
    fontFamily: 'Inter-Medium',
    overflow: 'hidden',
    minWidth: 20,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchPlaceholder: {
    flex: 1,
    height: 48,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.gray[400],
    paddingVertical: 12,
  },
  bottomSpace: {
    height: 100,
  },
});