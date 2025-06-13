import mockUserData from '../../assets/data/mock-data.json';
import type { Goal } from '../types';

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