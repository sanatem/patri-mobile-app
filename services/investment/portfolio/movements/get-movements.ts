import mockData from '@/data/mock/mock-data.json';
import config from '@/config/constants';
import type { ApiMovement } from '@/types/api';

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
  goalId?: string;
  goalName?: string;
  createdAt: string;
  state: string;
}

const getMovementType = (apiType: string): 'deposit' | 'withdrawal' => {
  const lowerType = apiType.toLowerCase();

  if (lowerType === 'deposit_intention' || lowerType === 'opening') {
    return 'deposit';
  }

  if (lowerType === 'retirement' || lowerType === 'retirement_from_goal' || lowerType === 'closing') {
    return 'withdrawal';
  }

  return 'deposit';
};


const getMovementTitle = (apiType: string): string => {
  const movementType = getMovementType(apiType);
  return movementType === 'deposit' ? 'Depósito' : 'Retiro';
};

const getMovementAmount = (movement: ApiMovement): number => {
  const { aasm_state, original_amount, investment_amount } = movement;
  
  if (['created', 'confirmed', 'settled'].includes(aasm_state)) {
    return original_amount;
  }
  
  if (aasm_state === 'finished') {
    return investment_amount;
  }
  
  return original_amount;
};

const transformApiMovement = (apiMovement: ApiMovement, goalName?: string): Movement => {
  return {
    id: apiMovement.id.toString(),
    title: getMovementTitle(apiMovement.type), 
    subtitle: new Date(apiMovement.created_at).toLocaleDateString('es-CO'),
    value: getMovementAmount(apiMovement),
    type: getMovementType(apiMovement.type),
    goalId: apiMovement.goal_id.toString(),
    goalName,
    createdAt: apiMovement.created_at,
    state: apiMovement.aasm_state,
    details: {
      tipo: apiMovement.type,
      metodo: apiMovement.payment_method,
      portafolio: apiMovement.broker_portfolio_name,
      estado: apiMovement.aasm_state,
    },
  };
};

export async function getMovements(token?: string): Promise<Movement[]> {
  try {
    if (!token) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockData.investmentMovements as Movement[];
    }

    const response = await fetch(`${config.apiBaseUrl}/api/v2/movements`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data: ApiMovement[] = await response.json();
      
      return data.map(movement => transformApiMovement(movement));
    }
    
    if (response.status === 401) {
      throw new Error('Token de autenticación inválido');
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockData.investmentMovements as Movement[];
    
  } catch (error) {
    console.error('Error fetching movements:', error);
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockData.investmentMovements as Movement[];
  }
}

export async function getMovementsByGoal(goalId?: string, token?: string): Promise<Movement[]> {
  try {
    if (!token) {
      const movements = await getMovements();
      return goalId ? movements.filter(movement => movement.title === goalId) : movements;
    }

    if (!goalId) {
      return getMovements(token);
    }

    const response = await fetch(`${config.apiBaseUrl}/api/v2/movements?goal_id=${goalId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data: ApiMovement[] = await response.json();
      
      return data.map(movement => transformApiMovement(movement));
    }
    
    if (response.status === 401) {
      throw new Error('Token de autenticación inválido');
    }
    
    const movements = await getMovements();
    return goalId ? movements.filter(movement => movement.title === goalId) : movements;
    
  } catch (error) {
    console.error('Error fetching movements by goal:', error);
    const movements = await getMovements();
    return goalId ? movements.filter(movement => movement.title === goalId) : movements;
  }
}