import React from 'react';
import { CreditCard, DollarSign, PiggyBank } from 'lucide-react-native';
import { FOR_YOU_CARDS } from '@/constants/AppConstants';
import { Carousel, CarouselCard } from '@/components/ui';

interface ForYouCarouselProps {
  style?: any;
  totalExpenses?: number;
}

const ForYouCarousel: React.FC<ForYouCarouselProps> = ({ style, totalExpenses }) => {
  const iconMap = {
    'Gastos': CreditCard,
    'Análisis de gastos': DollarSign,
    'Ahorro': PiggyBank,
  };

  const formatCurrency = (amount: number) => {
    return `$${Math.round(amount).toLocaleString('es-CL')}`;
  };

  const renderCard = ({ item }: { item: any }) => {
    const Icon = iconMap[item.category as keyof typeof iconMap];
    let title = item.title;
    if (item.category === 'Gastos' && typeof totalExpenses === 'number') {
      title = `${formatCurrency(totalExpenses)}/mes`;
    }
    return (
      <CarouselCard
        title={title}
        description={item.description}
        badge={{
          text: item.category,
          icon: <Icon size={16} color={item.iconColor} />,
          bgColor: item.bgColor,
          textColor: item.iconColor,
        }}
        onPress={() => {
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