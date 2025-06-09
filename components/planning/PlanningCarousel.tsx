import React, { useRef } from 'react';
import { 
  View, 
  ScrollView, 
  Dimensions,
} from 'react-native';
import { FileText, TrendingUp, PieChart } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { PlanningCard } from './PlanningCard';

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  fileType: string;
  size: string;
  contentPoints: string[];
}

interface PlanningCarouselProps {
  onCardPress?: (card: ReportCard) => void;
  onAIPress?: (card: ReportCard) => void;
}

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth * 0.8;
const sideMargin = (screenWidth - cardWidth) / 2;

const reportCards: ReportCard[] = [
  {
    id: '1',
    title: 'Reporte Financiero',
    description: 'Análisis completo de tu situación financiera',
    icon: FileText,
    color: Colors.primary[500],
    fileType: 'PDF',
    size: '2.1 MB',
    contentPoints: ['Balance patrimonial', 'Flujo de caja mensual', 'Recomendaciones personalizadas']
  },
  {
    id: '2',
    title: 'Inversión',
    description: 'Estado y rendimiento de tus inversiones',
    icon: TrendingUp,
    color: Colors.secondary[500],
    fileType: 'PDF',
    size: '1.9 MB',
    contentPoints: ['Análisis de performance', 'Distribución de activos', 'Comparación con benchmarks']
  },
  {
    id: '3',
    title: 'Estado Fondos Mutuos',
    description: 'Performance detallada de fondos mutuos',
    icon: PieChart,
    color: Colors.success[500],
    fileType: 'PDF',
    size: '2.7 MB',
    contentPoints: ['Evolución mensual', 'Composición de cartera', 'Ranking de rentabilidad']
  }
];

export default function PlanningCarousel({ onCardPress, onAIPress }: PlanningCarouselProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  const handleCardPress = (card: ReportCard) => {
    if (onCardPress) {
      onCardPress(card);
    }
  };

  const handleAIPress = (card: ReportCard) => {
    if (onAIPress) {
      onAIPress(card);
    }
  };

  const renderCard = (card: ReportCard, index: number) => {
    let marginLeft = 10;
    let marginRight = 10;
    
    if (index === 0) {
      marginLeft = sideMargin;
    }
    
    if (index === reportCards.length - 1) {
      marginRight = sideMargin;
    }
    
    return (
      <View
        key={card.id}
        style={{ 
          marginLeft: marginLeft,
          marginRight: marginRight
        }}
      >
        <PlanningCard
          title={card.title}
          description={card.description}
          contentPoints={card.contentPoints}
          fileType={card.fileType}
          fileSize={card.size}
          bulletColor={card.color}
          width={cardWidth}
          onPress={() => handleCardPress(card)}
          onAIPress={() => handleAIPress(card)}
        />
      </View>
    );
  };

  return (
    <View style={{ marginVertical: 4 }}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={cardWidth + 20}
        snapToAlignment="start"
        contentInset={{ left: 0, right: 0 }}
        contentContainerStyle={{ paddingHorizontal: 0 }}
        style={{ paddingVertical: 4 }}
      >
        {reportCards.map((card, index) => renderCard(card, index))}
      </ScrollView>
    </View>
  );
} 