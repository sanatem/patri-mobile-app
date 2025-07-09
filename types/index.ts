// Re-export all API types
export * from './api';

// Re-export chart types  
export * from './chart';

// Local asset and liability types
export interface Asset {
  id: string;
  name: string;
  type: string;
  value: number;
  change: number;
  color: string;
}

export interface Liability {
  id: string;
  name: string;
  type: string;
  value: number;
  change: number;
  color: string;
}
