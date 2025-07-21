import type { Goal } from '@/types/api';

export interface PortfolioCalculations {
  totalValue: number;
  totalTarget: number;
  averageProgress: number;
  totalReturnPercentage: number;
  totalReturnAmount: number;
}

export function calculatePortfolioTotals(goals: Goal[]): PortfolioCalculations {
  const totalValue = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalInvested = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  
  const averageProgress = totalTarget > 0 ? (totalValue / totalTarget) * 100 : 0;
  const totalReturnAmount = totalValue - totalInvested;
  const totalReturnPercentage = totalInvested > 0 ? (totalReturnAmount / totalInvested) * 100 : 0;

  return {
    totalValue,
    totalTarget,
    averageProgress,
    totalReturnPercentage,
    totalReturnAmount,
  };
}

export function formatCurrency(amount: number, currency: string = 'COP'): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function getGoalProgress(current: number, target: number): number {
  return target > 0 ? Math.min((current / target) * 100, 100) : 0;
}

export function getGoalTimeRemaining(targetDate: string): number {
  const target = new Date(targetDate.split('/').reverse().join('-'));
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(diffDays, 0);
}

export function categorizeGoalsByTimeframe(goals: Goal[]): {
  shortTerm: Goal[];
  mediumTerm: Goal[];
  longTerm: Goal[];
} {
  const shortTerm: Goal[] = [];
  const mediumTerm: Goal[] = [];
  const longTerm: Goal[] = [];

  goals.forEach(goal => {
    const daysRemaining = getGoalTimeRemaining(goal.targetDate);
    
    if (daysRemaining <= 365) {
      shortTerm.push(goal);
    } else if (daysRemaining <= 1095) {
      mediumTerm.push(goal);
    } else {
      longTerm.push(goal);
    }
  });

  return { shortTerm, mediumTerm, longTerm };
}

export function getProgressColor(progress: number): string {
  if (progress >= 80) return '#22c55e';
  if (progress >= 60) return '#f59e0b';
  if (progress >= 40) return '#f97316';
  return '#ef4444';
}

export function calculateMonthlyContribution(current: number, target: number, targetDate: string): number {
  const daysRemaining = getGoalTimeRemaining(targetDate);
  const monthsRemaining = Math.max(daysRemaining / 30, 1);
  const amountNeeded = target - current;
  
  return amountNeeded / monthsRemaining;
} 