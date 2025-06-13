import mockUserData from '../../assets/data/mock-data.json';
import type { UserProfile, InvestmentProfile } from '../types';

export const userService = {
  getUserProfile(): UserProfile {
    return mockUserData.userProfile;
  },
  getInvestmentProfile(): InvestmentProfile {
    return mockUserData.investmentProfile;
  }
};