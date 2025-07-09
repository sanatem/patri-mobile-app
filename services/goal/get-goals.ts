import mockUserData from '@/data/mock/mock-data.json';
import type { Goal } from '@/types/api';

export const goalsService = {
  getGoals(): {
    shortTerm: Goal[];
    mediumTerm: Goal[];
    longTerm: Goal[];
  } {
    return mockUserData.goals as {
      shortTerm: Goal[];
      mediumTerm: Goal[];
      longTerm: Goal[];
    };
  }
};