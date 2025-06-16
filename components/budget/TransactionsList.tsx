import React from 'react';
import { ListItem } from '@/components/ui';
import { budgetService } from '@/services/budget/get-budget';

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

const CATEGORY_TRANSLATIONS: Record<string, string> = {
  housing: 'Vivienda',
  transport: 'Transporte',
  credit: 'Crédito',
  utilities: 'Servicios',
  groceries: 'Supermercado',
  personal: 'Personal',
  salary: 'Salario',
  bonus: 'Bonos',
  investment: 'Inversión',
};

const processTransactionsByMonth = (selectedMonth: string, type: 'income' | 'expenses') => {
  const budget = budgetService.getBudget();
  const monthlyIncome = budgetService.getMonthlyIncome();
  const monthlyExpenses = budgetService.getMonthlyExpenses();
  
  const income: any[] = [];
  const expenses: any[] = [];
  
  if (type === 'income') {
    budget.monthlyIncome.forEach(transaction => {
      const percentage = ((transaction.amount / monthlyIncome) * 100).toFixed(1);
      income.push({
        id: transaction.title,
        title: transaction.title,
        subtitle: CATEGORY_TRANSLATIONS[transaction.category] || transaction.category,
        value: transaction.amount,
        badge: {
          text: `${percentage}%`,
          variant: 'positive' as const
        }
      });
    });
  } else {
    budget.monthlyExpenses.forEach(transaction => {
      const percentage = ((transaction.amount / monthlyExpenses) * 100).toFixed(1);
      expenses.push({
        id: transaction.title,
        title: transaction.title,
        subtitle: CATEGORY_TRANSLATIONS[transaction.category] || transaction.category,
        value: transaction.amount,
        badge: {
          text: `${percentage}%`,
          variant: 'negative' as const
        }
      });
    });
  }
  
  return { income, expenses };
};

const TransactionsList: React.FC<TransactionsListProps> = ({ type, selectedMonth }) => {
  const { income, expenses } = processTransactionsByMonth(selectedMonth, type);
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