import React from 'react';
import { CreditCard, DollarSign, PiggyBank } from 'lucide-react-native';
import { Carousel, CarouselCard } from '@/components/ui';

interface ForYouCarouselProps {
  style?: any;
}

const ForYouCarousel: React.FC<ForYouCarouselProps> = ({ style }) => {
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

  const renderCard = ({ item }: { item: any }) => {
    const Icon = item.icon;
    
    return (
      <CarouselCard
        title={item.title}
        description={item.description}
        badge={{
          text: item.category,
          icon: <Icon size={16} color={item.iconColor} />,
          bgColor: item.bgColor,
          textColor: item.iconColor,
        }}
        onPress={() => {
          console.log('Card pressed:', item.category);
        }}
      />
    );
  };

  return (
    <Carousel
      data={forYouCards}
      renderItem={renderCard}
      className="mt-8 mb-6"
      style={[{ height: 200 }, style]}
      contentContainerStyle={{ paddingLeft: 0 }}
    />
  );
};

export default ForYouCarousel; 