import mockData from '@/data/mock/mock-data.json';

export interface MovementDetails {
  tipo: string;
  metodo: string;
  portafolio: string;
  estado: string;
}

export interface Movement {
  id: string;
  title: string;
  subtitle: string;
  value: number;
  type: 'deposit' | 'withdrawal';
  details?: MovementDetails;
}

export async function getMovements(): Promise<Movement[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return mockData.investmentMovements as Movement[];
}

export async function getMovementsByGoal(goalId?: string): Promise<Movement[]> {
  const movements = await getMovements();
  
  if (!goalId) {
    return movements;
  }
  
  return movements.filter(movement => movement.title === goalId);
}