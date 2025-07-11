import mockUserData from '@/data/mock/mock-data.json';
import type { InvestmentPortfolio } from '@/types/api';
import config from '@/config/constants';

export const investmentService = {
  getPortfolio(): InvestmentPortfolio {
    return mockUserData.investmentPortfolio as InvestmentPortfolio;
  },

  async hasInvestmentAccount(token?: string): Promise<boolean> {
    try {
      if (!token) {
        return false;
      }

      const response = await fetch(`${config.apiBaseUrl}/api/v2/goals`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        const hasGoals = data.goals && data.goals.length > 0;
        const hasInvestmentAccountId = hasGoals && data.goals.some((goal: any) => goal.investment_account_id);
        
        return hasInvestmentAccountId;
      }
      
      if (response.status === 401) {
        return false;
      }
      
      if (response.status === 404) {
        return false;
      }
      
      return false;
      
    } catch (error) {
      console.error('Error checking investment account:', error);
      return false;
    }
  },
};