import mockUserData from '../../assets/data/mock-data.json';
import type { InvestmentMovement } from '../types';

export const investmentService = {
  getMovements(): InvestmentMovement[] {
    return mockUserData.investmentMovements as InvestmentMovement[];
  }
};