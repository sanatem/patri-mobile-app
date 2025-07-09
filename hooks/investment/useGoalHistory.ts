import { useState, useEffect } from 'react';

interface GoalHistoryItem {
  date: string;
  amount: number;
  projected: boolean;
}

interface UseGoalHistoryProps {
  goalName?: string;
  currentAmount?: number;
  targetAmount?: number;
  targetDate?: string;
}

interface UseGoalHistoryReturn {
  historyData: GoalHistoryItem[];
  loading: boolean;
  error: string | null;
  generateProjectedData: (current: number, target: number, targetDate: string) => GoalHistoryItem[];
}

export function useGoalHistory({ 
  goalName, 
  currentAmount, 
  targetAmount, 
  targetDate 
}: UseGoalHistoryProps = {}): UseGoalHistoryReturn {
  const [historyData, setHistoryData] = useState<GoalHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateProjectedData = (current: number, target: number, targetDateString: string): GoalHistoryItem[] => {
    const startDate = new Date();
    const endDate = new Date(targetDateString.split('/').reverse().join('-'));
    const monthsDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    const monthlyIncrement = (target - current) / Math.max(monthsDiff, 1);
    const projectedData: GoalHistoryItem[] = [];

    // Historical data (last 3 months)
    for (let i = 3; i >= 1; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const amount = Math.max(current - (monthlyIncrement * i), 0);
      projectedData.push({
        date: date.toISOString().slice(0, 7),
        amount: amount,
        projected: false
      });
    }

    // Current month
    projectedData.push({
      date: new Date().toISOString().slice(0, 7),
      amount: current,
      projected: false
    });

    // Future projections
    for (let i = 1; i <= Math.min(monthsDiff, 8); i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      const amount = Math.min(current + (monthlyIncrement * i), target);
      projectedData.push({
        date: date.toISOString().slice(0, 7),
        amount: amount,
        projected: true
      });
    }

    return projectedData;
  };

  useEffect(() => {
    if (currentAmount !== undefined && targetAmount !== undefined && targetDate) {
      try {
        setLoading(true);
        const projectedData = generateProjectedData(currentAmount, targetAmount, targetDate);
        setHistoryData(projectedData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error generando datos');
      } finally {
        setLoading(false);
      }
    }
  }, [currentAmount, targetAmount, targetDate]);

  return {
    historyData,
    loading,
    error,
    generateProjectedData,
  };
} 