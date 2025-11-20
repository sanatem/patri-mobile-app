// Get goals
export { goalsService } from './get-goals';

// Get goal history
export { goalHistoryService } from './get-goal-history';
export type { GoalHistoryParams, GoalHistoryPoint, GoalHistoryData } from './get-goal-history';

// Create goal
export { createGoal } from './create-goal';
export type { CreateGoalParams, CreateGoalResponse } from './create-goal';

// Update goal
export { updateGoal } from './update-goal';
export type { UpdateGoalParams, UpdateGoalResponse } from './update-goal';

// Delete goal
export { deleteGoal } from './delete-goal';
export type { DeleteGoalResponse } from './delete-goal';
