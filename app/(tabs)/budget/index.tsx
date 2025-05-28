import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, FlatList } from 'react-native';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import BudgetChart from '@/components/budget/BudgetChart';
import TransactionsList from '@/components/budget/TransactionsList';
import transactionsData from '@/transacciones_simplificadas.json';

const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Función para convertir nombre de mes a número
const getMonthNumber = (monthName: string): number => {
  return months.indexOf(monthName) + 1;
};

// Función para calcular totales de ingresos y gastos por mes
const calculateTotalsByMonth = (selectedMonth: string) => {
  const data = transactionsData[0];
  const transactions = data.transactions.accounts[0].transactions;
  const monthNumber = getMonthNumber(selectedMonth);
  
  let totalIncome = 0;
  let totalExpenses = 0;
  let incomeCount = 0;
  let expenseCount = 0;
  
  transactions.forEach((transaction: any) => {
    const transactionDate = new Date(transaction.date);
    const transactionMonth = transactionDate.getMonth() + 1; // getMonth() es 0-based
    
    // Solo contar transacciones del mes seleccionado
    if (transactionMonth === monthNumber) {
      if (transaction.in > 0) {
        totalIncome += transaction.in;
        incomeCount++;
      }
      if (transaction.out > 0) {
        totalExpenses += transaction.out;
        expenseCount++;
      }
    }
  });
  
  return { totalIncome, totalExpenses, incomeCount, expenseCount };
};

export default function BudgetScreen() {
  const [selectedMonth, setSelectedMonth] = useState('Enero');
  const [activeTab, setActiveTab] = useState<'income' | 'expenses'>('income');
  const [isMonthModalVisible, setIsMonthModalVisible] = useState(false);

  // Calcular totales para el mes seleccionado
  const { totalIncome, totalExpenses, incomeCount, expenseCount } = calculateTotalsByMonth(selectedMonth);

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

  const handleMonthSelect = (month: string) => {
    setSelectedMonth(month);
    setIsMonthModalVisible(false);
  };

  const renderMonthItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.monthItem,
        selectedMonth === item && styles.selectedMonthItem
      ]}
      onPress={() => handleMonthSelect(item)}
    >
      <Text style={[
        styles.monthItemText,
        selectedMonth === item && styles.selectedMonthItemText
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

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
            
            <TouchableOpacity 
              style={styles.monthButton}
              onPress={() => setIsMonthModalVisible(true)}
            >
              <Text style={styles.monthText}>{selectedMonth}</Text>
              <ChevronRight size={16} color={Colors.gray[500]} style={{ transform: [{ rotate: '90deg' }] }} />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleNextMonth}>
              <ChevronRight size={24} color={Colors.gray[700]} />
            </TouchableOpacity>
          </View>

          <BudgetChart selectedMonth={selectedMonth} />
          
          <View style={styles.legend}>
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
              Ingresos <Text style={styles.tabCount}>{incomeCount}</Text>
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
              Gastos <Text style={styles.tabCount}>{expenseCount}</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.gray[400]} style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>
            Buscar en {activeTab === 'income' ? 'ingresos' : 'gastos'}
          </Text>
        </View>

        <TransactionsList type={activeTab} selectedMonth={selectedMonth} />

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Modal para seleccionar mes */}
      <Modal
        visible={isMonthModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsMonthModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar mes</Text>
              <TouchableOpacity
                onPress={() => setIsMonthModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color={Colors.gray[600]} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={months}
              renderItem={renderMonthItem}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              style={styles.monthsList}
            />
          </View>
        </View>
      </Modal>
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
  legend: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.gray[800],
  },
  closeButton: {
    padding: 8,
  },
  monthsList: {
    width: '100%',
  },
  monthItem: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 2,
  },
  selectedMonthItem: {
    backgroundColor: Colors.primary[500],
  },
  monthItemText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.gray[800],
    textAlign: 'center',
  },
  selectedMonthItemText: {
    color: 'white',
  },
});