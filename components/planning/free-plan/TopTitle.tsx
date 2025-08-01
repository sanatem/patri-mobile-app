import React from 'react';
import { View, Text } from 'react-native';
import { ClipboardList } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

interface TopTitleProps {
  onPurchase?: () => void;
}

const TopTitle: React.FC<TopTitleProps> = ({ onPurchase }) => {
  const { t } = useTranslation();
  return (
      <View className="p-8 mx-4 mb-6 items-center mt-6">
        <Text 
          className="text-2xl font-medium text-center mb-4"
          style={{ color: Colors.primary[700] }}
        >
          {t('planning.top_title')}
        </Text>
        <Text 
          className="text-base text-center mb-5 font-regular leading-6"
          style={{ color: Colors.gray[600] }}
        >
          {t('planning.top_title')}
        </Text>
      </View>
  );
};

export default TopTitle; 