import mockUserData from '@/data/mock/mock-data.json';
import type { UserProfile, InvestmentProfile } from '@/types/api';

export const userService = {
  getUserProfile(): UserProfile {
    return mockUserData.userProfile;
  },
  getInvestmentProfile(): InvestmentProfile {
    return mockUserData.investmentProfile;
  }
};