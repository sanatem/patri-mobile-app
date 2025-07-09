import mockUserData from '@/data/mock/mock-data.json';
import type { InvestmentPortfolio } from '@/types/api';

export const investmentService = {
  getPortfolio(): InvestmentPortfolio {
    return mockUserData.investmentPortfolio as InvestmentPortfolio;
  },
};