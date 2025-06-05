import React, { useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
} from 'react-native';
import { FileText, BarChart3, TrendingUp, PieChart, Download, Sparkles } from 'lucide-react-native';
import Colors from '@/constants/Colors';

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
    const IconComponent = card.icon;
    
    // Cálculo dinámico de márgenes
    let marginLeft = 10;
    let marginRight = 10;
    
    if (index === 0) {
      // Primera card: margen izquierdo grande para centrar
      marginLeft = sideMargin;
    }
    
    if (index === reportCards.length - 1) {
      // Última card: margen derecho grande para centrar
      marginRight = sideMargin;
    }
    
    return (
      <TouchableOpacity
        key={card.id}
        style={[
          styles.card,
          { 
            marginLeft: marginLeft,
            marginRight: marginRight
          }
        ]}
        onPress={() => handleCardPress(card)}
        activeOpacity={0.95}
      >
        {/* AI Button */}
        <TouchableOpacity 
          style={styles.aiButton}
          onPress={() => handleAIPress(card)}
          activeOpacity={0.8}
        >
          <Sparkles size={14} color="#ffffff" fill="#ffffff" />
        </TouchableOpacity>

        <View style={styles.cardHeader}>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardDescription}>{card.description}</Text>
            
            <View style={styles.contentPoints}>
              {card.contentPoints.map((point, index) => (
                <View key={index} style={styles.pointRow}>
                  <View style={[styles.bullet, { backgroundColor: card.color }]} />
                  <Text style={styles.pointText}>{point}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        
        <View style={styles.cardFooter}>
          <View style={styles.fileInfo}>
            <Text style={styles.fileType}>{card.fileType}</Text>
            <Text style={styles.fileSize}>{card.size}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.downloadButton]}
            onPress={() => handleCardPress(card)}
          >
            <Download size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={cardWidth + 20}
        snapToAlignment="start"
        contentInset={{ left: 0, right: 0 }}
        contentContainerStyle={styles.scrollContainer}
        style={styles.scrollView}
      >
        {reportCards.map((card, index) => renderCard(card, index))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  scrollView: {
    paddingVertical: 4,
  },
  scrollContainer: {
    paddingHorizontal: 0,
  },
  card: {
    width: cardWidth,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
    justifyContent: 'space-between',
  },
  aiButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardContent: {
    flex: 1,
    paddingRight: 16,
  },
  cardTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 17,
    color: Colors.gray[900],
    marginBottom: 8,
  },
  cardDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: Colors.gray[700],
    lineHeight: 18,
    marginBottom: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileType: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: Colors.gray[700],
    backgroundColor: Colors.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  fileSize: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: Colors.gray[500],
  },
  downloadButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary[500],
  },
  contentPoints: {
    marginBottom: 24,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 8,
  },
  pointText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: Colors.gray[700],
    lineHeight: 16,
  },
}); 