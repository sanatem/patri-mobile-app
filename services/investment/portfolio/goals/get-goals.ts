import config from '@/config/constants';
import type { Goal } from '@/types/api';

interface ApiGoal {
  id: number;
  name: string;
  kind: string;
  kind_name: string;
  target_amount: number;
  target_date: string;
  unit: string;
  created_at: string;
  wallet_value: number;
  investment_account_id: number;
}

interface GoalsApiResponse {
  goals: ApiGoal[];
  total_count: number;
}
  
const transformApiGoalToAppGoal = (apiGoal: ApiGoal): Goal => {
  return {
    id: apiGoal.id.toString(),
    name: apiGoal.name,
    kind: apiGoal.kind,
    kindName: apiGoal.kind_name,
    targetAmount: apiGoal.target_amount,
    targetDate: apiGoal.target_date,
    unit: apiGoal.unit,
    createdAt: apiGoal.created_at,
    currentAmount: apiGoal.wallet_value,
    investmentAccountId: apiGoal.investment_account_id,
    progress: apiGoal.target_amount > 0 
      ? Math.round((apiGoal.wallet_value / apiGoal.target_amount) * 100) 
      : 0
  };
};

const categorizeGoalsByTime = (goals: Goal[]): {
  shortTerm: Goal[];
  mediumTerm: Goal[];
  longTerm: Goal[];
} => {
  const result = {
    shortTerm: goals.filter(goal => {
      const targetDate = goal.targetDate.toLowerCase();
      return targetDate.includes('1') && targetDate.includes('3');
    }),
    mediumTerm: goals.filter(goal => {
      const targetDate = goal.targetDate.toLowerCase();
      return (targetDate.includes('3') && targetDate.includes('5')) ||
             (targetDate.includes('2') && targetDate.includes('4'));
    }),
    longTerm: goals.filter(goal => {
      const targetDate = goal.targetDate.toLowerCase();
      return (targetDate.includes('5') && targetDate.includes('9')) ||
             (targetDate.includes('6')) ||
             (targetDate.includes('7')) ||
             (targetDate.includes('8')) ||
             (targetDate.includes('9')) ||
             (targetDate.includes('10'));
    })
  };

  return result;
};

export const goalsService = {
  async getGoals(token: string): Promise<{
    shortTerm: Goal[];
    mediumTerm: Goal[];
    longTerm: Goal[];
  }> {
    try {
      if (!token) {
        throw new Error('No hay token de autenticación disponible');
      }

      const response = await fetch(`${config.apiBaseUrl}/api/v2/goals`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        if (response.status === 401) {
          throw new Error('Token de autenticación inválido o expirado');
        }
        
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const data: GoalsApiResponse = await response.json();

      const transformedGoals = data.goals.map(transformApiGoalToAppGoal);

      const categorizedGoals = categorizeGoalsByTime(transformedGoals);

      return categorizedGoals;

    } catch (error) {
      console.error('❌ Goals Service: Error fetching goals from API:', error);
      
      if (__DEV__) {
        const mockUserData = require('@/data/mock/mock-data.json');
        return mockUserData.goals as {
          shortTerm: Goal[];
          mediumTerm: Goal[];
          longTerm: Goal[];
        };
      }
      
      throw error;
    }
  }
};