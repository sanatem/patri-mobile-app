import mockUserData from '../../assets/data/mock-data.json';
import type { InvestmentAction } from '../types';

export const investmentService = {
  getActionsData() {
    return mockUserData.investmentPortfolio.actions as InvestmentAction[];
  }
};