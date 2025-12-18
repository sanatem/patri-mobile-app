import React, { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';

interface BudgetDateContextType {
  // Selected date state
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  
  // Formatted period string (e.g., "Diciembre de 2025")
  currentPeriod: string;
  
  // Selected month name (e.g., "Diciembre")
  selectedMonth: string;
  
  // Selected year string (e.g., "2025")
  selectedYear: string;
  
  // Navigation handlers
  handlePreviousMonth: () => void;
  handleNextMonth: () => void;
  
  // Check if current month is selected
  isCurrentMonth: boolean;
  
  // Date range for API calls
  getMonthDateRange: () => { start_date: string; end_date: string };
}

const BudgetDateContext = createContext<BudgetDateContextType | null>(null);

interface BudgetDateProviderProps {
  children: ReactNode;
}

export function BudgetDateProvider({ children }: BudgetDateProviderProps) {
  // Selected date state - starts at current month
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    // Set to first day of current month to avoid timezone issues
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Format selected date as "Diciembre de 2025" using locale
  const formatMonthYear = useCallback((date: Date): string => {
    return date.toLocaleString('es-CL', { month: 'long', year: 'numeric' })
      .replace(/^\w/, c => c.toUpperCase()); // Capitalize first letter
  }, []);

  // Get month name (e.g., "Diciembre")
  const getMonthName = useCallback((date: Date): string => {
    return date.toLocaleString('es-CL', { month: 'long' })
      .replace(/^\w/, c => c.toUpperCase());
  }, []);

  // Current period display string
  const currentPeriod = useMemo(() => formatMonthYear(selectedDate), [selectedDate, formatMonthYear]);

  // Selected month name
  const selectedMonth = useMemo(() => getMonthName(selectedDate), [selectedDate, getMonthName]);

  // Selected year string
  const selectedYear = useMemo(() => selectedDate.getFullYear().toString(), [selectedDate]);

  // Get start and end dates for the selected month (YYYY-MM-DD format)
  const getMonthDateRange = useCallback(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    // First day of month
    const startDate = new Date(year, month, 1);
    // Last day of month
    const endDate = new Date(year, month + 1, 0);

    const formatDate = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    return {
      start_date: formatDate(startDate),
      end_date: formatDate(endDate)
    };
  }, [selectedDate]);

  // Navigate to previous month
  const handlePreviousMonth = useCallback(() => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);


  const handleNextMonth = useCallback(() => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  // Check if current month is selected (to optionally disable "next" button)
  const isCurrentMonth = useMemo(() => {
    const now = new Date();
    return selectedDate.getFullYear() === now.getFullYear() &&
           selectedDate.getMonth() === now.getMonth();
  }, [selectedDate]);

  const value: BudgetDateContextType = {
    selectedDate,
    setSelectedDate,
    currentPeriod,
    selectedMonth,
    selectedYear,
    handlePreviousMonth,
    handleNextMonth,
    isCurrentMonth,
    getMonthDateRange,
  };

  return (
    <BudgetDateContext.Provider value={value}>
      {children}
    </BudgetDateContext.Provider>
  );
}

export function useBudgetDate() {
  const context = useContext(BudgetDateContext);
  if (!context) {
    throw new Error('useBudgetDate must be used within a BudgetDateProvider');
  }
  return context;
}

