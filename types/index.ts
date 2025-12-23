
export * from './api';

export * from './chart';

export * from './device';
export * from './security';

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
