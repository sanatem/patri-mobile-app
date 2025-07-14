import React, { useMemo } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { ListItem } from '@/components/ui/ListItem';
import { budgetService } from '@/services/budget/get-budget';
import { FloidTransaction } from '@/services/budget/get-floid-transactions';
import Colors from '@/constants/Colors';

interface TransactionsListProps {
  type: 'income' | 'expenses';
  selectedMonth: string;
  showContainer?: boolean;
  floidTransactions?: FloidTransaction[];
  searchQuery?: string;
  loading?: boolean;
  hasRealData?: boolean; // ✅ Nueva prop para indicar si hay datos reales
}

export default function TransactionsList({ 
  type, 
  selectedMonth, 
  showContainer = true,
  floidTransactions,
  searchQuery = '',
  loading = false,
  hasRealData = false // ✅ Por defecto false
}: TransactionsListProps) {

  const transactionsData = useMemo(() => {
    // ✅ SOLO USAR DATOS FLOID SI HAY DATOS REALES
    const hasFloidData = hasRealData && 
                        floidTransactions && 
                        Array.isArray(floidTransactions) && 
                        floidTransactions.length > 0;
    
    if (hasFloidData) {
      const targetTransactionType = type === 'income' ? 'income' : 'outcome';
      
      const filteredByType = floidTransactions!.filter(transaction => {
        return transaction.transaction_type === targetTransactionType;
      });

      const filteredBySearch = searchQuery 
        ? filteredByType.filter(transaction =>
            transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            transaction.bank.toLowerCase().includes(searchQuery.toLowerCase()) ||
            transaction.account_number.includes(searchQuery)
          )
        : filteredByType;

      return filteredBySearch.map(transaction => {
        const isIncome = transaction.transaction_type === 'income';
        return {
          id: transaction.id.toString(),
          title: transaction.description.charAt(0).toUpperCase() + transaction.description.slice(1).toLowerCase(),
          subtitle: `${transaction.bank} - ${transaction.account_number}`,
          value: `${isIncome ? '+' : '-'}$${Math.round(transaction.amount).toLocaleString('es-CL')}`,
          icon: {
            backgroundColor: isIncome ? Colors.success[100] : Colors.error[100],
            text: isIncome ? '+' : '-',
            color: isIncome ? Colors.success[600] : Colors.error[600],
          },
          badge: {
            text: new Date(transaction.date).toLocaleDateString('es-CL'),
            variant: 'neutral' as const
          }
        };
      });
      
    } else {
      // ✅ NO USAR DATOS MOCK - Devolver array vacío
      return [];
    }
  }, [floidTransactions, type, searchQuery, hasRealData]);

  // ✅ ESTADO DE CARGA
  if (loading) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <Text style={{ 
          marginTop: 10,
          fontSize: 14,
          fontFamily: 'Poppins-Regular',
          color: Colors.gray[600]
        }}>
          Cargando transacciones...
        </Text>
      </View>
    );
  }

  // ✅ ESTADO VACÍO - Mejorado para distinguir entre sin datos del mes y búsqueda sin resultados
  if (transactionsData.length === 0) {
    return (
      <View style={{ padding: 40, alignItems: 'center' }}>
        <Text style={{ 
          fontSize: 16,
          fontFamily: 'Poppins-SemiBold',
          color: Colors.gray[600],
          textAlign: 'center',
          marginBottom: 8,
        }}>
          {!hasRealData && !searchQuery
            ? `Sin ${type === 'income' ? 'ingresos' : 'gastos'} en ${selectedMonth}`
            : searchQuery 
              ? 'Sin resultados'
              : `Sin ${type === 'income' ? 'ingresos' : 'gastos'}`
          }
        </Text>
        <Text style={{ 
          fontSize: 14,
          fontFamily: 'Poppins-Regular',
          color: Colors.gray[500],
          textAlign: 'center',
          lineHeight: 20,
        }}>
          {!hasRealData && !searchQuery
            ? `No hay transacciones de ${type === 'income' ? 'ingresos' : 'gastos'} registradas para este mes`
            : searchQuery 
              ? `No se encontraron ${type === 'income' ? 'ingresos' : 'gastos'} que coincidan con "${searchQuery}"`
              : `No hay ${type === 'income' ? 'ingresos' : 'gastos'} disponibles`
          }
        </Text>
      </View>
    );
  }

  // ✅ LISTA DE TRANSACCIONES REALES
  return (
    <ListItem
      data={transactionsData}
      showLoadMore={false}
      showContainer={showContainer}
    />
  );
}