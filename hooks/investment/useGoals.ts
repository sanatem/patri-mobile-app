import { useState, useEffect } from 'react';
import { goalsService } from '@/services/goal/get-goals';
import type { Goal } from '@/types/api';

interface UseGoalsReturn {
  goals: {
    shortTerm: Goal[];
    mediumTerm: Goal[];
    longTerm: Goal[];
  };
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useGoals(): UseGoalsReturn {
  const [goals, setGoals] = useState<{
    shortTerm: Goal[];
    mediumTerm: Goal[];
    longTerm: Goal[];
  }>({
    shortTerm: [],
    mediumTerm: [],
    longTerm: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const goalsData = goalsService.getGoals();
      setGoals(goalsData);
    } catch (err) {
      console.error('Error loading goals:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  return {
    goals,
    loading,
    error,
    refetch: fetchGoals,
  };
} 