import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Colors from '@/constants/Colors';
import transactionsData from '@/transacciones_simplificadas.json';

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
  const data = type === 'income' ? incomeData : expensesData;
  
  // Mostrar solo las últimas 10 transacciones para mejor rendimiento
  const limitedData = data.slice(0, 10);

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
        data={limitedData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        scrollEnabled={false}
      />
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
    borderBottomColor: Colors.gray[200],
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.gray[800],
    marginBottom: 4,
  },
  transactionDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.gray[500],
  },
  transactionAmount: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  incomeAmount: {
    color: Colors.success[500],
  },
  expenseAmount: {
    color: Colors.error[500],
  },
});

export default TransactionsList;