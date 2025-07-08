import React from 'react';
import { View, Text } from 'react-native';
import { ClipboardList } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface TopTitleProps {
  onPurchase?: () => void;
}

const TopTitle: React.FC<TopTitleProps> = ({ onPurchase }) => {
  return (
      <View className="p-8 mx-4 mb-6 items-center mt-6">
        <Text 
          className="text-2xl font-medium text-center mb-4"
          style={{ color: Colors.primary[700] }}
        >
          Comienza tu planificación financiera
        </Text>
        <Text 
          className="text-base text-center mb-5 font-regular leading-6"
          style={{ color: Colors.gray[600] }}
        >
          Accede a herramientas profesionales y asesoría experta para alcanzar tus metas financieras
        </Text>
      </View>
  );
};

export default TopTitle; 