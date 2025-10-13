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
  consultingHoursAvailable?: number;
}

const SectionPlan: React.FC<SectionPlanProps> = ({ onCardPress, isSubscribed, consultingHoursAvailable = 0 }) => {
  const { t } = useTranslation();
  const planCardsData: PlanCardData[] = [
    {
      id: '1',
      title: t('plans.premium.title'),
      price: t('plans.premium.price'),
      description: t('plans.premium.description'),
      buttonText: t('plans.premium.button'),
      duration: t('common.per_month'),
      iconType: 'coins' as const
    },
    {
      id: 'consulting',
      title: t('plans.consulting.title'),
      price: t('plans.consulting.price'),
      description: t('plans.consulting.description'),
      buttonText: t('plans.consulting.button'),
      iconType: 'calendar' as const
    },
    {
      id: '2',
      title: t('plans.general.title'),
      description: t('plans.general.description'),
      buttonText: t('plans.general.button'),
      iconType: 'coins' as const,
      minPrice: t('plans.general.min_price'),
      minDuration: t('plans.general.min_duration'),
    },
  ];
  return (
    <View className="mb-6 px-4">
      {planCardsData.map((item) => {
        const isSubscriptionCard = item.id === '1';
        const isConsultingCard = item.id === 'consulting';
        
        let modifiedItem = item;

        if (isSubscriptionCard && isSubscribed) {
          modifiedItem = {
            ...item,
            buttonText: t('common.already_subscribed'),
            badge: {
              text: t('common.active'),
              bgColor: '#ff6501',
              textColor: '#FFFFFF'
            }
          };
        }

        if (isConsultingCard && consultingHoursAvailable > 0) {
          const hoursText = consultingHoursAvailable === 1 
            ? t('plans.consulting.oneHourAvailable')
            : t('plans.consulting.hoursAvailable', { count: consultingHoursAvailable });
          
          modifiedItem = {
            ...item,
            badge: {
              text: hoursText,
              bgColor: '#22c55e',
              textColor: '#FFFFFF'
            }
          };
        }

        const isDisabled = isSubscriptionCard && isSubscribed;

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
                if (!isDisabled) {
                  onCardPress?.(item);
                }
              }}
              disabled={isDisabled}
            />
          </View>
        );
      })}
    </View>
  );
};

export default SectionPlan; 