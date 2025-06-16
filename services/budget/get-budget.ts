// services/budget/get-budget.ts
import mockUserData from '@/assets/data/mock-data.json';

interface BudgetCategory {
  label: string;
  color: string;
  description: string;
}

interface BudgetTransaction {
  title: string;
  description: string;
  amount: number;
  category: string;
  frequency: string;
}

interface Budget {
  categories: BudgetCategory[];
  monthlyIncome: BudgetTransaction[];
  monthlyExpenses: BudgetTransaction[];
}

const calculateTotalAmount = (transactions: BudgetTransaction[]): number => {
  return transactions.reduce((total, transaction) => total + transaction.amount, 0);
};

const calculateCategoryTotals = (transactions: BudgetTransaction[]): Record<string, number> => {
  const totals: Record<string, number> = {};
  transactions.forEach(transaction => {
    const category = transaction.category.toLowerCase();
    totals[category] = (totals[category] || 0) + transaction.amount;
  });
  return totals;
};

const defaultCategories: BudgetCategory[] = [
  {
    label: 'Vivienda',
    color: '#6366F1',
    description: 'Gastos de vivienda e hipoteca'
  },
  {
    label: 'Transporte',
    color: '#3B82F6',
    description: 'Gastos de transporte y vehículo'
  },
  {
    label: 'Ocio',
    color: '#EC4899',
    description: 'Entretenimiento y diversión'
  },
  {
    label: 'Salud',
    color: '#06B6D4',
    description: 'Gastos médicos y salud'
  },
  {
    label: 'Servicios',
    color: '#10B981',
    description: 'Servicios básicos y utilidades'
  }
];

export const budgetService = {
  getBudget(): Budget {
    return {
      categories: defaultCategories,
      monthlyIncome: mockUserData.monthlyIncome,
      monthlyExpenses: mockUserData.monthlyExpenses
    };
  },
  getCategories(): BudgetCategory[] {
    return defaultCategories;
  },
  getMonthlyIncome(): number {
    return calculateTotalAmount(mockUserData.monthlyIncome);
  },
  getMonthlyExpenses(): number {
    return calculateTotalAmount(mockUserData.monthlyExpenses);
  },
  getCategoryTotals(): Record<string, number> {
    return calculateCategoryTotals(mockUserData.monthlyExpenses);
  }
};