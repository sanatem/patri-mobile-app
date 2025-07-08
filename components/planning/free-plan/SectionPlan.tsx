import React from 'react';
import { View } from 'react-native';
import SectionPlanCard from './SectionPlanCard';

const planCardsData = [
  {
    id: '1',
    title: 'Sesión con un experto',
    price: '$45.000',
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
  },
];

interface SectionPlanProps {
  onCardPress?: (card: any) => void;
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
            onPress={() => onCardPress?.(item)}
          />
        </View>
      ))}
    </View>
  );
};

export default SectionPlan; 