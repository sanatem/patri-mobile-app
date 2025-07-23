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
  badge?: {
    text: string;
    bgColor?: string;
    textColor?: string;
  };
}

const planCardsData: PlanCardData[] = [
  {
    id: '1',
    title: 'Plan Premium (móvil)',
    price: '$9.990',
    description: 'Accede a todas las funcionalidades premium y herramientas avanzadas de planificación financiera.',
    buttonText: 'Suscribirme',
    duration: '/mes',
    iconType: 'coins' as const
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
  isSubscribed?: boolean;
}

const SectionPlan: React.FC<SectionPlanProps> = ({ onCardPress, isSubscribed }) => {
  return (
    <View className="mb-6 px-4">
      {planCardsData.map((item) => {
        // Modificar la primera tarjeta (Plan Premium móvil) si el usuario ya está suscrito
        const isSubscriptionCard = item.id === '1';
        const modifiedItem = isSubscriptionCard && isSubscribed 
          ? {
              ...item,
              buttonText: 'Ya suscrito',
              badge: {
                text: 'Activo',
                bgColor: '#ff6501',
                textColor: '#FFFFFF'
              }
            }
          : item;

        return (
          <View key={item.id} className="mb-4">
            <SectionPlanCard
              title={modifiedItem.title}
              price={modifiedItem.price}
              description={modifiedItem.description}
              buttonText={modifiedItem.buttonText}
              duration={modifiedItem.duration}
              iconType={modifiedItem.iconType}
              minPrice={modifiedItem.minPrice}
              minDuration={modifiedItem.minDuration}
              badge={modifiedItem.badge}
              onPress={() => {
                // Solo permitir click si no está suscrito o es la segunda tarjeta (Planes)
                if (!isSubscriptionCard || !isSubscribed) {
                  onCardPress?.(item);
                }
              }}
              disabled={isSubscriptionCard && isSubscribed}
            />
          </View>
        );
      })}
    </View>
  );
};

export default SectionPlan; 