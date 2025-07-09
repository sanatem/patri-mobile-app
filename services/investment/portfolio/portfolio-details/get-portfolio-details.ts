import mockData from '@/data/mock/mock-data.json';

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
  };
  assets: Array<{
    id: string;
    title: string;
    subtitle: string;
    value: number;
    badge: {
      text: string;
      variant: 'positive' | 'negative' | 'neutral';
    };
  }>;
}

export async function getPortfolioDetails(metaName: string): Promise<MetaDetails | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const investment = mockData.investmentPortfolio.investments.find(
    inv => inv.title === metaName
  );
  
  if (!investment) {
    return null;
  }
  
  const progress = investment.currentAmount / investment.targetAmount;
  
  const createdAt = '13/08/2024';
  
  const goalDate = '18/06/2025';
  
  let yearsRange = 'entre 5 y 9 meses';
  if (investment.riskLevel === 'moderado') {
    yearsRange = 'entre 2 y 5 años';
  } else if (investment.riskLevel === 'conservador') {
    yearsRange = 'entre 5 y 10 años';
  }
  
  const summary = {
    estrategia: 'Recomendación de Algoritmo',
    riesgo: investment.riskLevel === 'muy-conservador' ? 'Muy Conservador' : 
            investment.riskLevel === 'conservador' ? 'Conservador' : 
            investment.riskLevel === 'moderado' ? 'Moderado' : 'Arriesgado',
    aportes: investment.investmentDetails?.depositedAmount || 0,
    rescates: 0,
  };
  
  const assets = [
    {
      id: '1',
      title: 'Singular S&P 500',
      subtitle: 'CFISP500',
      value: Math.floor(investment.currentAmount * 0.3),
      badge: { text: '+0,35%', variant: 'positive' as const }
    },
    {
      id: '2',
      title: 'Singular Nasdaq 100',
      subtitle: 'CFINASDAQ',
      value: Math.floor(investment.currentAmount * 0.7),
      badge: { text: '+0,12%', variant: 'positive' as const }
    }
  ];
  
  return {
    id: investment.id,
    name: investment.title,
    createdAt,
    goal: investment.targetAmount,
    goalDate,
    yearsRange,
    progress,
    current: investment.currentAmount,
    currency: 'CLP',
    summary,
    assets
  };
}