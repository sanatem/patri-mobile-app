import mockUserData from '../../assets/data/mock-data.json';
import type { InvestmentPortfolio } from '../types';

export const investmentService = {
  getPortfolio(): InvestmentPortfolio {
    return mockUserData.investmentPortfolio as InvestmentPortfolio;
  },
};