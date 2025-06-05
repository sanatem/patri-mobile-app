import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { CreditCard, TrendingUp, DollarSign, PiggyBank } from 'lucide-react-native';

interface ForYouCarouselProps {
  style?: any;
}

const ForYouCarousel: React.FC<ForYouCarouselProps> = ({ style }) => {
  // Cards para el carrusel "FOR YOU"
  const forYouCards = [
    {
      id: '1',
      category: 'Gastos',
      icon: CreditCard,
      iconColor: '#06b6d4',
      bgColor: '#e0f2fe',
      title: '$89,500/mes',
      description: 'gastado en servicios básicos, encuentra formas de ahorrar ahora',
    },
    {
      id: '2',
      category: 'Análisis de gastos',
      icon: DollarSign,
      iconColor: '#f59e0b',
      bgColor: '#fef3c7',
      title: '$1.250.000 típicamente',
      description: 'profundiza en tus gastos de los últimos seis meses',
    },
    {
      id: '3',
      category: 'Ahorro',
      icon: PiggyBank,
      iconColor: '#10b981',
      bgColor: '#d1fae5',
      title: 'Meta mensual',
      description: 'establece metas de ahorro y alcanza tus objetivos financieros',
    },
  ];

  const renderForYouCard = ({ item }: { item: any }) => {
    const Icon = item.icon;
    return (
      <TouchableOpacity style={styles.forYouCard}>
        <View style={[styles.categoryBadge, { backgroundColor: item.bgColor }]}>
          <Icon size={16} color={item.iconColor} />
          <Text style={[styles.categoryText, { color: item.iconColor }]}>
            {item.category}
          </Text>
        </View>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription}>{item.description}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.forYouSection, style]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContainer}
      >
        {forYouCards.map((card) => (
          <View key={card.id} style={styles.cardWrapper}>
            {renderForYouCard({ item: card })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  forYouSection: {
    marginTop: 32,
    marginBottom: 24,
    height: 200,
  },
  carouselContainer: {
    paddingLeft: 0,
    alignItems: 'flex-start',
  },
  cardWrapper: {
    marginRight: 16,
    height: 180,
  },
  forYouCard: {
    width: 280,
    height: 180,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    marginLeft: 6,
  },
  cardTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 22,
    color: '#1f2937',
    marginBottom: 6,
  },
  cardDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 18,
  },
});

export default ForYouCarousel; 