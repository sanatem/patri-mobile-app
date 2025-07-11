import React from 'react';
import { View } from 'react-native';
import PortfolioSummaryCard from '../cards/PortfolioSummaryCard';
import PortfolioAssetsCard from '../cards/PortfolioAssetsCard';
import PortfolioMovementsCard from '../cards/PortfolioMovementsCard';

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
  return (
    <View>
      <PortfolioSummaryCard 
        title="Ver resumen" 
        summary={summary} 
      />
      <PortfolioAssetsCard 
        title="Ver activos" 
        assets={assets} 
      />
      <PortfolioMovementsCard 
        title="Movimientos" 
        movements={movements}
        goalName={goalName}
        goalId={goalId}
      />
    </View>
  );
} 