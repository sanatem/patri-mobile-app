import React from 'react';
import { ListItem } from '@/components/ui';
import ForYouCarousel from '@/components/common/ForYouCarousel';
import transactionsData from '@/transacciones_simplificadas.json';

interface TransactionsListProps {
  type: 'income' | 'expenses';
  selectedMonth: string;
}

const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const getMonthNumber = (monthName: string): number => {
  return months.indexOf(monthName) + 1;
};

const processTransactionsByMonth = (selectedMonth: string) => {
  const data = transactionsData[0];
  const transactions = data.transactions.accounts[0].transactions;
  const monthNumber = getMonthNumber(selectedMonth);
  
  const income: any[] = [];
  const expenses: any[] = [];
  
  // Primero calcular totales para obtener porcentajes
  let totalIncome = 0;
  let totalExpenses = 0;
  
  transactions.forEach((transaction: any) => {
    const transactionDate = new Date(transaction.date);
    const transactionMonth = transactionDate.getMonth() + 1;
    
    if (transactionMonth === monthNumber) {
      if (transaction.in > 0) totalIncome += transaction.in;
      if (transaction.out > 0) totalExpenses += transaction.out;
    }
  });
  
  // Ahora procesar transacciones con porcentajes
  transactions.forEach((transaction: any) => {
    const transactionDate = new Date(transaction.date);
    const transactionMonth = transactionDate.getMonth() + 1;
    
    if (transactionMonth === monthNumber) {
      if (transaction.in > 0) {
        let title = 'Ingreso';
        let description = transaction.description;
        
        if (description.includes('Depósito de sueldo') || description.includes('sueldo')) {
          title = 'Salario';
          description = 'Depósito de sueldo';
        } else if (description.includes('Transferencia de')) {
          title = 'Transferencia';
        } else {
          title = 'Otros ingresos';
        }
        
        // Calcular porcentaje del total de ingresos
        const percentage = ((transaction.in / totalIncome) * 100).toFixed(1);
        
        income.push({
          id: transaction.id,
          title,
          subtitle: description,
          value: transaction.in,
          badge: {
            text: `${percentage}%`,
            variant: 'positive' as const
          }
        });
      }
      
      if (transaction.out > 0) {
        let category = 'Otros';
        const companyName = transaction.description.toLowerCase();
        
        if (companyName.includes('metrogas') || companyName.includes('aguas andinas') || 
            companyName.includes('enel') || companyName.includes('movistar') || 
            companyName.includes('entel')) {
          category = 'Servicios';
        } else if (companyName.includes('amazon') || companyName.includes('mercadolibre') || 
                   companyName.includes('falabella')) {
          category = 'Ocio';
        }
        
        // Calcular porcentaje del total de gastos
        const percentage = ((transaction.out / totalExpenses) * 100).toFixed(1);
        
        expenses.push({
          id: transaction.id,
          title: transaction.description,
          subtitle: category,
          value: transaction.out,
          badge: {
            text: `${percentage}%`,
            variant: 'negative' as const
          }
        });
      }
    }
  });
  
  return { income, expenses };
};

const TransactionsList: React.FC<TransactionsListProps> = ({ type, selectedMonth }) => {
  const { income, expenses } = processTransactionsByMonth(selectedMonth);
  const data = type === 'income' ? income : expenses;

  return (
    <>
      <ListItem 
        data={data}
        className="px-4"
        initialItemCount={10}
        loadMoreStep={10}
      />
    </>
  );
};

export default TransactionsList;