import config from '@/config/constants';
import { safeCurrencyToNumber } from '@/lib/utils';

export interface MetaDetails {
  id: string;
  name: string;
  createdAt: string;
  goal: number;
  goalDate: string;
  yearsRange: string;
  progress: number;
  current: number;
  currency: string;
  summary: {
    estrategia: string;
    riesgo: string;
    aportes: number;
    rescates: number;
    variacion: string;
    variacionPesos: number;
  };
  assets: Array<{
    id: string;
    title: string;
    subtitle: string;
    value: number;
    availableQuotas: number;
    quotaValue: number;
    badge: {
      text: string;
      variant: 'positive' | 'negative' | 'neutral';
    };
  }>;
}

interface ApiGoalDetails {
  goal: {
    id: number;
    name: string;
    kind: string;
    kind_name: string;
    target_amount: number;
    target_date: string;
    unit: string;
    created_at: string;
    goal_wallet: number;
    investment_account_id: number;
  };
  presenter_data?: {
    deposit_sum: number;
    retirement_sum: number;
    variation?: number;
    goal_last_portfolio_kind: string;
    goal_last_portfolio_risk_profile: string;
    wallet_containers: Array<{
      wallet_container_id: number;
      broker_product_id: number;
      broker_product_code: string;
      broker_product_name: string;
      quotas: number;
      available_quotas_for_retirement: number;
      current_value: number;
      available_value_for_retirement: number;
      quota_value: number;
      percentage: number;
    }>;
    broker_portfolio: {
      id: number;
      kind: string;
      risk_profile: string;
      name: string;
      composition: Array<{
        product_code: string;
        percentage: number;
      }>;
    };
  };
}

const formatSafeDate = (dateString: string): string => {
  if (!dateString) return 'Fecha no disponible';
  
  try {
    if (dateString.includes('En menos de') || dateString.includes('año') || dateString.includes('mes')) {
      return dateString;
    }
    
    if (dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const year = parseInt(parts[2]);
        
        if (isNaN(day) || isNaN(month) || isNaN(year) || 
            day < 1 || day > 31 || month < 1 || month > 12 || year < 1900) {
          return 'Fecha no disponible';
        }
        
        return dateString;
      }
    }
    
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Fecha no disponible';
    }
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
    
  } catch (error) {
    return 'Fecha no disponible';
  }
};

const getSafeNumber = (value: any, defaultValue: number = 0): number => {
  return safeCurrencyToNumber(value, defaultValue);
};

const formatPercentage = (value: any): string => {
  const safeValue = getSafeNumber(value, 0);
  return `${safeValue.toFixed(2)}%`;
};

const transformApiGoalToMetaDetails = (apiData: ApiGoalDetails): MetaDetails => {
  const { goal, presenter_data } = apiData;
  
  const targetAmount = getSafeNumber(goal.target_amount, 0);
  const currentAmount = getSafeNumber(goal.goal_wallet, 0);
  
  const progress = targetAmount > 0 
    ? currentAmount / targetAmount 
    : 0;

  const createdAt = formatSafeDate(goal.created_at);
  const goalDate = formatSafeDate(goal.target_date);
  
  const yearsRange = goal.target_date || 'No especificado';

  const getRiskLabel = (riskProfile?: string): string => {
    switch (riskProfile) {
      case 'very_low': return 'Muy Conservador';
      case 'low': return 'Conservador';
      case 'medium': return 'Moderado';
      case 'high': return 'Arriesgado';
      default: return 'Moderado';
    }
  };

  const calculateVariation = () => {
    return formatPercentage(presenter_data?.variation || 0);
  };

  const summary = {
    estrategia: 'Recomendación de Algoritmo',
    riesgo: getRiskLabel(presenter_data?.broker_portfolio?.risk_profile || presenter_data?.goal_last_portfolio_risk_profile),
    aportes: getSafeNumber(presenter_data?.deposit_sum, 0),
    rescates: getSafeNumber(presenter_data?.retirement_sum, 0),
    variacion: calculateVariation(),
    variacionPesos: getSafeNumber(presenter_data?.variation, 0),
  };

  const assets = (presenter_data?.wallet_containers || []).map((container, index) => ({
    id: getSafeNumber(container.wallet_container_id, index + 1).toString(),
    title: container.broker_product_name || 'Producto',
    subtitle: container.broker_product_code || 'Código',
    value: getSafeNumber(container.available_value_for_retirement, 0),
    availableQuotas: getSafeNumber(container.available_quotas_for_retirement, 0),
    quotaValue: getSafeNumber(container.quota_value, 0),
    badge: {
      text: formatPercentage(presenter_data?.variation),
      variant: getSafeNumber(presenter_data?.variation, 0) >= 0 ? 'positive' as const : 'negative' as const
    }
  }));

  if (assets.length === 0) {
    assets.push({
      id: goal.id.toString(),
      title: goal.name || 'Meta',
      subtitle: goal.kind_name || 'Meta',
      value: currentAmount,
      availableQuotas: 0,
      quotaValue: 0,
      badge: {
        text: formatPercentage(0),
        variant: 'positive' as const
      }
    });
  }

  return {
    id: goal.id.toString(),
    name: goal.name,
    createdAt,
    goal: targetAmount,
    goalDate,
    yearsRange,
    progress,
    current: currentAmount,
    currency: goal.unit,
    summary,
    assets
  };
};

export async function getPortfolioDetails(goalId: string, token: string): Promise<MetaDetails | null> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const response = await fetch(`${config.apiBaseUrl}/api/v2/goals/${goalId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      if (response.status === 404) {
        return null;
      }
      
      if (response.status === 401) {
        throw new Error('Token de autenticación inválido o expirado');
      }
      
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data: ApiGoalDetails = await response.json();
    
    try {
      return transformApiGoalToMetaDetails(data);
    } catch (transformError) {
      console.error('Error transforming API data:', transformError);
      throw transformError;
    }

  } catch (error) {
    console.error('Portfolio Details Service: Error fetching goal details from API:', error);
    
    
    throw error;
  }
}