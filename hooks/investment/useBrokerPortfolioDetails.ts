import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import config from '@/config/constants';

interface BrokerPortfolio {
  id: number;
  kind: string;
  risk_profile: string;
  name: string;
  composition: Array<{
    product_code: string;
    percentage: number;
  }>;
}

interface UseBrokerPortfolioDetailsProps {
  goalId?: string;
}

interface UseBrokerPortfolioDetailsReturn {
  brokerPortfolio: BrokerPortfolio | null;
  loading: boolean;
  error: string | null;
}

export function useBrokerPortfolioDetails({ goalId }: UseBrokerPortfolioDetailsProps): UseBrokerPortfolioDetailsReturn {
  const { accessToken } = useAuth();
  const [brokerPortfolio, setBrokerPortfolio] = useState<BrokerPortfolio | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrokerPortfolio = async () => {
      if (!goalId || !accessToken) {
        setBrokerPortfolio(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${config.apiBaseUrl}/api/v2/goals/${goalId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.presenter_data?.broker_portfolio) {
          setBrokerPortfolio(data.presenter_data.broker_portfolio);
        } else {
          setBrokerPortfolio(null);
        }
      } catch (err) {
        console.error('useBrokerPortfolioDetails: Error loading broker portfolio:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setBrokerPortfolio(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBrokerPortfolio();
  }, [goalId, accessToken]);

  return {
    brokerPortfolio,
    loading,
    error,
  };

  function getProductDisplayName(productCode: string): string {
    const productNames: Record<string, string> = {
      'CFIETFCC': 'ETF Commodities',
      'CFISP500': 'S&P 500',
      'CFINASDAQ': 'NASDAQ',
      'CFIETFGE': 'ETF Global Equity',
      'CFIETFRF': 'ETF Renta Fija',
      'CFIETFEM': 'ETF Emergentes',
    };
    
    return productNames[productCode] || productCode;
  }

  function getRiskProfileDisplayName(riskProfile: string): string {
    switch (riskProfile) {
      case 'conservative':
        return 'Conservador';
      case 'moderate':
        return 'Moderado';
      case 'risky':
        return 'Arriesgado';
      default:
        return riskProfile;
    }
  }
}
