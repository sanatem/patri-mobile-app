import React from 'react';
import { View } from 'react-native';
import PortfolioSummaryCard from '../cards/PortfolioSummaryCard';
import PortfolioAssetsCard from '../cards/PortfolioAssetsCard';
import PortfolioMovementsCard from '../cards/PortfolioMovementsCard';
import { useTranslation } from 'react-i18next';

interface SummaryItem {
  title: string;
  value: string;
  description?: string;
}

interface Asset {
  name: string;
  percentage: number;
  value: string;
  allocation: string;
}

interface MovementDetails {
  tipo: string;
  metodo: string;
  portafolio: string;
  estado: string;
}

interface Movement {
  id: string;
  title: string;
  subtitle: string;
  value: number;
  type: 'deposit' | 'withdrawal';
  details?: MovementDetails;
  createdAt: string;
  state: string;
}

interface PortfolioOverviewSectionProps {
  summary: SummaryItem[];
  assets: Asset[];
  movements: Movement[];
  goalName?: string;
  goalId?: string;
}

export default function PortfolioOverviewSection({ summary, assets, movements, goalName, goalId }: PortfolioOverviewSectionProps) {
  const { t } = useTranslation();
  return (
    <View>
      <PortfolioSummaryCard 
        title={t('portfolio.view_summary')} 
        summary={summary} 
      />
      <PortfolioAssetsCard 
        title={t('portfolio.view_assets')} 
        assets={assets} 
      />
      <PortfolioMovementsCard 
        title={t('movements.title')}  
        movements={movements}
        goalName={goalName}
        goalId={goalId}
      />
    </View>
  );
} 