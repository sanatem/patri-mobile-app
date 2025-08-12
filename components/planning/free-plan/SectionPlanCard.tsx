import React from 'react';
import { View, Text } from 'react-native';
import { Calendar, Coins, Clock } from 'lucide-react-native';
import { Card, Button } from '@/components/ui';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

interface SectionPlanCardProps {
  title: string;
  price?: string;
  description: string;
  buttonText: string;
  duration?: string;
  iconType?: 'calendar' | 'coins';
  badge?: {
    text: string;
    bgColor?: string;
    textColor?: string;
  };
  minPrice?: string;
  minDuration?: string;
  onPress?: () => void;
  disabled?: boolean;
}

const SectionPlanCard: React.FC<SectionPlanCardProps> = ({
  title,
  price,
  description,
  buttonText,
  duration,
  iconType,
  badge,
  minPrice,
  minDuration,
  onPress,
  disabled = false
}) => {
  const { t } = useTranslation();
  const renderIcon = () => {
    const iconProps = {
      size: 16,
      color: Colors.primary[700]
    };

    let IconComponent = null;
    if (iconType === 'calendar') {
      IconComponent = <Calendar {...iconProps} />;
    } else if (iconType === 'coins') {
      IconComponent = <Coins {...iconProps} />;
    }

    if (IconComponent) {
      return (
        <View 
          className="rounded-full mr-2 mb-1 justify-center items-center"
          style={{ 
            backgroundColor: Colors.gray[50],
            width: 32,
            height: 32
          }}
        >
          {IconComponent}
        </View>
      );
    }
    return null;
  };

  return (
  <Card variant="elevated" className="w-full" style={{ minHeight: 200 }}>
    <View className="py-6 px-6 flex-1">
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-row items-center flex-1">
          {renderIcon()}
          <Text className="text-lg font-medium" style={{ color: Colors.primary[700] }}>
            {title}
          </Text>
        </View>
        {badge && (
          <View 
            className="px-3 py-1 rounded-full"
            style={{ 
              backgroundColor: badge.bgColor || Colors.success[500],
            }}
          >
            <Text 
              className="text-sm font-medium"
              style={{ color: badge.textColor || Colors.light.background }}
            >
              {badge.text}
            </Text>
          </View>
        )}
      </View>
      <View className="w-full mb-4" style={{ backgroundColor: Colors.gray[100], height: 0.5 }} />
      {price && (
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-medium" style={{ color: Colors.primary[700] }}>
            {price}
          </Text>
          {duration && (
            <View className="flex-row items-center">
              {duration !== '/mes' && (
                <Clock size={16} color={Colors.gray[500]} style={{ marginRight: 4 }} />
              )}
              <Text className="text-lg font-medium" style={{ color: Colors.gray[500] }}>
                {duration}
              </Text>
            </View>
          )}
        </View>
      )}
      {(minPrice || minDuration) && (
        <View className="flex-row items-start justify-between mb-4">
          {minPrice && (
            <View className="flex-1">
              <Text className="text-lg font-medium" style={{ color: Colors.primary[700] }}>
                {minPrice}
              </Text>
              <Text className="text-xs" style={{ color: Colors.gray[500] }}>
                {t('common.from')}
              </Text>
            </View>
          )}
          {minDuration && (
            <View className="flex-1 items-end">
              <Text className="text-lg font-medium" style={{ color: Colors.gray[600] }}>
                {minDuration}
              </Text>
              <Text className="text-xs" style={{ color: Colors.gray[500] }}>
                {t('common.from')}
              </Text>
            </View>
          )}
        </View>
      )}
      
      <Text className="text-base mb-6 font-regular leading-6" style={{ color: Colors.gray[600] }}>
        {description}
      </Text>
      <Button
        title={buttonText}
        variant={disabled ? "disabled" : "outline"}
        size="large"
        onPress={disabled ? (() => {}) : (onPress || (() => {}))}
        fullWidth={true}
        disabled={disabled}
      />
    </View>
  </Card>
  );
};

export default SectionPlanCard; 