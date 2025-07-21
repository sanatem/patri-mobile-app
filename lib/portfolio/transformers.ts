import type { Goal } from '@/types/api';
import { formatCurrency, getGoalProgress } from './utils';

interface TransformedGoal {
  id: string;
  title: string;
  currentAmount: number;
  targetAmount: number;
  progress: number;
  deadline: string;
  formattedCurrent: string;
  formattedTarget: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  daysRemaining?: number;
}

interface TransformedPortfolioSummary {
  totalValue: string;
  totalTarget: string;
  averageProgress: number;
  goalsCount: number;
  completedGoalsCount: number;
}

export function transformGoal(goal: Goal): TransformedGoal {
  const progress = getGoalProgress(goal.currentAmount, goal.targetAmount);
  
  return {
    id: goal.id,
    title: goal.name,
    currentAmount: goal.currentAmount,
    targetAmount: goal.targetAmount,
    progress,
    deadline: goal.targetDate,
    formattedCurrent: formatCurrency(goal.currentAmount),
    formattedTarget: formatCurrency(goal.targetAmount),
    priority: 'medium',
    category: goal.kind,
  };
}

export function transformGoalsList(goals: Goal[]): TransformedGoal[] {
  return goals.map(transformGoal);
}

export function transformPortfolioSummary(goals: Goal[]): TransformedPortfolioSummary {
  const totalValue = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const averageProgress = totalTarget > 0 ? (totalValue / totalTarget) * 100 : 0;
  const completedGoalsCount = goals.filter(goal => 
    getGoalProgress(goal.currentAmount, goal.targetAmount) >= 100
  ).length;

  return {
    totalValue: formatCurrency(totalValue),
    totalTarget: formatCurrency(totalTarget),
    averageProgress,
    goalsCount: goals.length,
    completedGoalsCount,
  };
}

export function groupGoalsByPriority(goals: Goal[]): {
  high: TransformedGoal[];
  medium: TransformedGoal[];
  low: TransformedGoal[];
} {
  const transformedGoals = transformGoalsList(goals);
  
  return {
    high: transformedGoals.filter(goal => goal.priority === 'high'),
    medium: transformedGoals.filter(goal => goal.priority === 'medium'),
    low: transformedGoals.filter(goal => goal.priority === 'low'),
  };
}

export function groupGoalsByCategory(goals: Goal[]): Record<string, TransformedGoal[]> {
  const transformedGoals = transformGoalsList(goals);
  const categories: Record<string, TransformedGoal[]> = {};
  
  transformedGoals.forEach(goal => {
    if (!categories[goal.category]) {
      categories[goal.category] = [];
    }
    categories[goal.category].push(goal);
  });
  
  return categories;
}

export function getTopPriorityGoals(goals: Goal[], limit: number = 3): TransformedGoal[] {
  const transformedGoals = transformGoalsList(goals);
  
  return transformedGoals
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      
      return a.progress - b.progress;
    })
    .slice(0, limit);
} 