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
        const responseData = await response.json();

        // La respuesta tiene la estructura: { success: true, data: { investment: {...}, savings: {...} } }
        const data = responseData.data || responseData;

        return Boolean(data?.investment?.account_id);
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

  async hasAnyInvestmentOrSavingsAccount(token?: string): Promise<boolean> {
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
        const responseData = await response.json();

        // La respuesta tiene la estructura: { success: true, data: { investment: {...}, savings: {...} } }
        const data = responseData.data || responseData;

        const hasInvestmentAccount = data.investment && data.investment.account_id;
        const hasSavingsAccount = data.savings && data.savings.account_id;

        return hasInvestmentAccount || hasSavingsAccount;
      }

      return false;

    } catch (error) {
      console.error('Error checking investment or savings accounts:', error);
      return false;
    }
  },
};