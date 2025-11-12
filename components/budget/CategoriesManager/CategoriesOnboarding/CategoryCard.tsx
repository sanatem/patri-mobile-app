import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { CheckboxItem } from '@/components/ui';
import Colors from '@/constants/Colors';

interface CategoryCardProps {
  category: any;
  isSelected: boolean;
  onToggle: () => void;
  currentLang: string;
}

export function CategoryCard({ category, isSelected, onToggle, currentLang }: CategoryCardProps) {
  const animationValue = useRef(new Animated.Value(isSelected ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animationValue, {
      toValue: isSelected ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  }, [isSelected, animationValue]);

  const checkboxOpacity = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1]
  });

  const checkboxScale = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1]
  });

  return (
    <TouchableOpacity
      onPress={onToggle}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: isSelected ? Colors.primary[200] : Colors.gray[100],
        marginBottom: 12,
      }}
      activeOpacity={0.7}
    >
      <Text className="text-2xl font-medium" style={{ marginRight: 12 }}>{category.emoji}</Text>

      <View style={{ flex: 1 }}>
        <Text
          className="text-base font-medium"
          style={{
            color: isSelected ? Colors.primary[700] : Colors.gray[900],
          }}
        >
          {category.name[currentLang as keyof typeof category.name] || category.name.es}
        </Text>
      </View>

      <Animated.View style={{
        marginLeft: 12,
        opacity: checkboxOpacity,
        transform: [{ scale: checkboxScale }]
      }}>
        <CheckboxItem selected={isSelected} size={24} />
      </Animated.View>
    </TouchableOpacity>
  );
}
