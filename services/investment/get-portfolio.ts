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

      const url = `${config.apiBaseUrl}/api/v2/goals`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        const hasInvestmentAccount = data.investment && data.investment.account_id;
        const hasSavingsAccount = data.savings && data.savings.account_id;

        const hasAnyAccount = hasInvestmentAccount || hasSavingsAccount;
        
        return hasAnyAccount;
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