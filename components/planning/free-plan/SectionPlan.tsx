import React from 'react';
import { View } from 'react-native';
import SectionPlanCard from './SectionPlanCard';

interface PlanCardData {
  id: string;
  title: string;
  price?: string;
  description: string;
  buttonText: string;
  duration?: string;
  iconType: 'calendar' | 'coins';
  minPrice?: string;
  minDuration?: string;
}

const planCardsData: PlanCardData[] = [
  {
    id: '1',
    title: 'Sesión con un experto',
    price: '$69.000',
    description: 'Una sesión enfocada para responder preguntas, evaluar decisiones y avanzar hacia tus objetivos.',
    buttonText: 'Agendar sesión',
    duration: '60 min.',
    iconType: 'calendar' as const
  },
  {
    id: '2',
    title: 'Planes',
    description: 'Descubre nuestros planes y empieza hoy a construir un mejor futuro financiero',
    buttonText: 'Ver planes',
    iconType: 'coins' as const,
    minPrice: '$99.000 /mes',
    minDuration: '3 meses',
  },
];

interface SectionPlanProps {
  onCardPress?: (card: PlanCardData) => void;
}

const SectionPlan: React.FC<SectionPlanProps> = ({ onCardPress }) => {
  return (
    <View className="mb-6 px-4">
      {planCardsData.map((item) => (
        <View key={item.id} className="mb-4">
          <SectionPlanCard
            title={item.title}
            price={item.price}
            description={item.description}
            buttonText={item.buttonText}
            duration={item.duration}
            iconType={item.iconType}
            minPrice={item.minPrice}
            minDuration={item.minDuration}
            onPress={() => onCardPress?.(item)}
          />
        </View>
      ))}
    </View>
  );
};

export default SectionPlan; 