import config from '@/config/constants';
import type { Goal } from '@/types/api';
import { categorizeGoalsByTimeframe } from '@/lib/portfolio/utils';

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

interface AccountGoals {
  account_id: number;
  account_name: string;
  goals: ApiGoal[];
  total_count: number;
}

interface GoalsApiResponse {
  investment?: AccountGoals;
  savings?: AccountGoals;
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
    currentAmount: Math.round(apiGoal.wallet_value),
    investmentAccountId: apiGoal.investment_account_id,
    progress: apiGoal.target_amount > 0 
      ? Math.round((apiGoal.wallet_value / apiGoal.target_amount) * 100) 
      : 0
  };
};

const transformMockGoalToAppGoal = (mockGoal: any): Goal => {
  return {
    id: mockGoal.id.toString(),
    name: mockGoal.title,
    kind: mockGoal.category || 'general',
    kindName: mockGoal.category || 'Meta general',
    targetAmount: mockGoal.targetAmount || 0,
    targetDate: mockGoal.deadline || 'Sin fecha',
    unit: 'CLP',
    createdAt: '2024-01-01',
    currentAmount: Math.round(mockGoal.currentAmount || 0),
    investmentAccountId: 1083,
    progress: (mockGoal.targetAmount || 0) > 0 
      ? Math.round(((mockGoal.currentAmount || 0) / mockGoal.targetAmount) * 100) 
      : 0
  };
};

export const goalsService = {
  async getGoals(token: string): Promise<{
    investment: {
      shortTerm: Goal[];
      mediumTerm: Goal[];
      longTerm: Goal[];
      accountInfo?: {
        id: number;
        name: string;
      };
    };
    savings: {
      shortTerm: Goal[];
      mediumTerm: Goal[];
      longTerm: Goal[];
      accountInfo?: {
        id: number;
        name: string;
      };
    };
  }> {
    try {
      if (!token) {
        throw new Error('No hay token de autenticación disponible');
      }

      const url = `${config.apiBaseUrl}/api/v2/goals`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Goals Service: Error en respuesta:', response.status, errorText);
        
        if (response.status === 401) {
          throw new Error('Token de autenticación inválido o expirado');
        }
        
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const data: GoalsApiResponse = await response.json();

      const investmentGoals = data.investment?.goals?.map(transformApiGoalToAppGoal) || [];
      const categorizedInvestmentGoals = categorizeGoalsByTimeframe(investmentGoals);
      const savingsGoals = data.savings?.goals?.map(transformApiGoalToAppGoal) || [];
      const categorizedSavingsGoals = categorizeGoalsByTimeframe(savingsGoals);

      const result = {
        investment: {
          ...categorizedInvestmentGoals,
          accountInfo: data.investment ? {
            id: data.investment.account_id,
            name: data.investment.account_name
          } : undefined
        },
        savings: {
          ...categorizedSavingsGoals,
          accountInfo: data.savings ? {
            id: data.savings.account_id,
            name: data.savings.account_name
          } : undefined
        }
      };

      return result;

    } catch (error) {
      console.error('Goals Service: Error fetching goals from API:', error);
      
      if (__DEV__) {
        const mockUserData = require('@/data/mock/mock-data.json');
        const mockGoalsData = mockUserData.goals;
        const transformedMockGoals = {
          shortTerm: mockGoalsData.shortTerm.map(transformMockGoalToAppGoal),
          mediumTerm: mockGoalsData.mediumTerm.map(transformMockGoalToAppGoal),
          longTerm: mockGoalsData.longTerm.map(transformMockGoalToAppGoal)
        };
        
        return {
          investment: {
            ...transformedMockGoals,
            accountInfo: {
              id: 1083,
              name: "Cuenta de inversión"
            }
          },
          savings: {
            shortTerm: [],
            mediumTerm: [],
            longTerm: [],
            accountInfo: {
              id: 1451,
              name: "Cuenta de ahorro"
            }
          }
        };
      }
      
      throw error;
    }
  }
};