import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Colors from '@/constants/Colors';

interface TransactionsListProps {
  type: 'income' | 'expenses';
}

// Mock data
const incomeData = [
  {
    id: '1',
    title: 'Salario',
    description: 'Sueldo mensual',
    amount: 2202599,
  },
  {
    id: '2',
    title: 'Salario',
    description: 'Sueldo mensual',
    amount: 2109979,
  },
  {
    id: '3',
    title: 'Salario',
    description: 'Sueldo mensual',
    amount: 1888019,
  },
  {
    id: '4',
    title: 'Salario',
    description: 'Sueldo mensual',
    amount: 2262910,
  },
  {
    id: '5',
    title: 'Salario',
    description: 'Sueldo mensual',
    amount: 1525997,
  },
  {
    id: '6',
    title: 'Salario',
    description: 'Sueldo mensual',
    amount: 1923676,
  },
];

const expensesData = [
  {
    id: '1',
    title: 'Arriendo',
    description: 'Departamento',
    amount: -750000,
    category: 'Vivienda',
  },
  {
    id: '2',
    title: 'Supermercado',
    description: 'Compra semanal',
    amount: -125400,
    category: 'Alimentación',
  },
  {
    id: '3',
    title: 'Seguro de salud',
    description: 'Plan familiar',
    amount: -98500,
    category: 'Salud',
  },
  {
    id: '4',
    title: 'Combustible',
    description: 'Gasolina',
    amount: -45000,
    category: 'Transporte',
  },
  {
    id: '5',
    title: 'Netflix',
    description: 'Suscripción mensual',
    amount: -12900,
    category: 'Ocio',
  },
];

const TransactionsList: React.FC<TransactionsListProps> = ({ type }) => {
  const data = type === 'income' ? incomeData : expensesData;

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