import React from 'react';
import { View } from 'react-native';
import SectionPlanCard from './SectionPlanCard';
import { useTranslation } from 'react-i18next';

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



interface SectionPlanProps {
  onCardPress?: (card: PlanCardData) => void;
  isSubscribed?: boolean;
}

const SectionPlan: React.FC<SectionPlanProps> = ({ onCardPress, isSubscribed }) => {
  const { t } = useTranslation();
  const planCardsData: PlanCardData[] = [
    {
      id: '1',
      title: t('planning.cardTitles.premiumMobile'),
      price: '$9.990',
      description: t('plans.premium.description'),
      buttonText: t('plans.premium.button'),
      duration: t('common.per_month'),
      iconType: 'coins' as const
    },
    {
      id: '2',
      title: t('planning.cardTitles.plans'),
      description: t('plans.plans.description'),
      buttonText: t('plans.ver_planes'),
      iconType: 'coins' as const,
      minPrice: t('plans.general.min_price'),
      minDuration: t('plans.general.min_duration'),
    },
  ];
  return (
    <View className="mb-6 px-4">
      {planCardsData.map((item) => {
        const isSubscriptionCard = item.id === '1';
        const modifiedItem = isSubscriptionCard && isSubscribed 
          ? {
              ...item,
              buttonText: t('common.already_subscribed'),
              badge: {
                text: t('common.active'),
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