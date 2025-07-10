import { useState, useEffect } from 'react';
import { goalsService } from '@/services/investment/portfolio/goals/get-goals';
import { useAuth } from '@/providers/AuthProvider';
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
  const { accessToken, isAuthenticated } = useAuth();
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
      
      if (!accessToken) {
        throw new Error('No hay token de autenticación disponible');
      }
      
      const goalsData = await goalsService.getGoals(accessToken);
      setGoals(goalsData);
    } catch (err) {
      console.error('Error loading goals:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      fetchGoals();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, accessToken]);

  return {
    goals,
    loading,
    error,
    refetch: fetchGoals,
  };
} 