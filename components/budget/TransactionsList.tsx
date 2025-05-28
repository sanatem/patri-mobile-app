import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Colors from '@/constants/Colors';
import transactionsData from '@/transacciones_simplificadas.json';
import ForYouCarousel from '@/components/common/ForYouCarousel';

interface TransactionsListProps {
  type: 'income' | 'expenses';
  selectedMonth: string;
}

const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Función para convertir nombre de mes a número
const getMonthNumber = (monthName: string): number => {
  return months.indexOf(monthName) + 1;
};

// Función para procesar las transacciones del JSON filtradas por mes
const processTransactionsByMonth = (selectedMonth: string) => {
  const data = transactionsData[0]; // Tomamos el primer caso
  const transactions = data.transactions.accounts[0].transactions;
  const monthNumber = getMonthNumber(selectedMonth);
  
  const income: any[] = [];
  const expenses: any[] = [];
  
  transactions.forEach((transaction: any, index: number) => {
    const transactionDate = new Date(transaction.date);
    const transactionMonth = transactionDate.getMonth() + 1; // getMonth() es 0-based
    
    // Solo procesar transacciones del mes seleccionado
    if (transactionMonth === monthNumber) {
      if (transaction.in > 0) {
        // Es un ingreso
        let title = 'Ingreso';
        let description = transaction.description;
        
        // Categorizar ingresos por descripción
        if (description.includes('Depósito de sueldo') || description.includes('sueldo')) {
          title = 'Salario';
          description = 'Depósito de sueldo';
        } else if (description.includes('Transferencia de')) {
          title = 'Transferencia';
          description = description; // Mantener el nombre de la persona
        } else {
          title = 'Otros ingresos';
          description = description;
        }
        
        income.push({
          id: transaction.id,
          title,
          description,
          amount: transaction.in,
          date: transaction.date,
        });
      }
      
      if (transaction.out > 0) {
        // Es un gasto
        let title = transaction.description; // Usar la descripción directamente como título
        let description = transaction.description;
        let category = 'Otros';
        
        // Categorizar por tipo de empresa/servicio
        const companyName = transaction.description.toLowerCase();
        
        if (companyName.includes('metrogas') || companyName.includes('aguas andinas') || 
            companyName.includes('enel')) {
          category = 'Servicios';
        } else if (companyName.includes('movistar') || companyName.includes('entel') || 
                   companyName.includes('claro') || companyName.includes('wom') ||
                   companyName.includes('vtr') || companyName.includes('gtd')) {
          category = 'Servicios';
        } else if (companyName.includes('amazon') || companyName.includes('mercadolibre') || 
                   companyName.includes('falabella') || companyName.includes('sony') ||
                   companyName.includes('ripley') || companyName.includes('linio')) {
          category = 'Ocio';
        } else if (companyName.includes('envío a ') || companyName.includes('transferencia a ')) {
          category = 'Transporte';
        } else if (companyName.includes('comisión') || companyName.includes('banco')) {
          category = 'Servicios';
        } else {
          category = 'Otros';
        }
        
        expenses.push({
          id: transaction.id,
          title,
          description,
          amount: -transaction.out, // Negativo para gastos
          category,
          date: transaction.date,
        });
      }
    }
  });
  
  return { income, expenses };
};

const TransactionsList: React.FC<TransactionsListProps> = ({ type, selectedMonth }) => {
  const { income: incomeData, expenses: expensesData } = processTransactionsByMonth(selectedMonth);
  const allData = type === 'income' ? incomeData : expensesData;
  
  const [visibleCount, setVisibleCount] = useState(10);
  
  // Mostrar solo las transacciones visibles
  const data = allData.slice(0, visibleCount);
  const hasMore = visibleCount < allData.length;

  const loadMore = () => {
    setVisibleCount(prev => prev + 10);
  };

  // Reiniciar cuando cambie el mes o tipo
  React.useEffect(() => {
    setVisibleCount(10);
  }, [selectedMonth, type]);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionTitle}>{item.title}</Text>
        <Text style={styles.transactionDescription}>{item.description}</Text>
      </View>
      <Text style={[
        styles.transactionAmount,
        item.amount >= 0 ? styles.incomeAmount : styles.expenseAmount
      ]}>
        {item.amount >= 0 ? '+' : ''}${Math.abs(item.amount).toLocaleString('es-CL')}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        scrollEnabled={false}
      />
      {hasMore && (
        <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore}>
          <Text style={styles.loadMoreText}>
            Ver más ({allData.length - visibleCount} restantes)
          </Text>
        </TouchableOpacity>
      )}
      
      <ForYouCarousel />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 4,
  },
  transactionDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6b7280',
  },
  transactionAmount: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  incomeAmount: {
    color: '#10b981',
  },
  expenseAmount: {
    color: '#ef4444',
  },
  loadMoreButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  loadMoreText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#3b82f6',
  },
});

export default TransactionsList;