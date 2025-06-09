import React from 'react';
import { CreditCard, DollarSign, PiggyBank } from 'lucide-react-native';
import { FOR_YOU_CARDS } from '@/constants/AppConstants';
import { Carousel, CarouselCard } from '@/components/ui';

interface ForYouCarouselProps {
  style?: any;
}

const ForYouCarousel: React.FC<ForYouCarouselProps> = ({ style }) => {
  const iconMap = {
    'Gastos': CreditCard,
    'Análisis de gastos': DollarSign,
    'Ahorro': PiggyBank,
  };

  const renderCard = ({ item }: { item: any }) => {
    const Icon = iconMap[item.category as keyof typeof iconMap];
    
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
      data={Array.from(FOR_YOU_CARDS)}
      renderItem={renderCard}
      className="mt-8 mb-6"
      style={[{ height: 200 }, style]}
      contentContainerStyle={{ paddingLeft: 0 }}
    />
  );
};

export default ForYouCarousel; 