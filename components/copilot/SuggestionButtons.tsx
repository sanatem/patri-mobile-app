import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

interface SuggestionButtonsProps {
  suggestions: Array<{
    text: string;
    icon: keyof typeof Ionicons.glyphMap;
  }>;
  onSuggestionPress: (suggestion: string) => void;
}

export function SuggestionButtons({ suggestions, onSuggestionPress }: SuggestionButtonsProps) {
  const pairs = [];
  for (let i = 0; i < suggestions.length; i += 2) {
    pairs.push(suggestions.slice(i, i + 2));
  }

  return (
    <View className="w-full px-4">
      {pairs.map((pair, pairIndex) => (
        <View key={pairIndex} className="flex-row justify-between mb-4">
          {pair.map((item) => (
            <TouchableOpacity
              key={item.text}
              className="bg-white py-6 px-4 rounded-2xl flex-1 mx-2 border border-gray-200"
              style={{
                elevation: 2,
              }}
              onPress={() => onSuggestionPress(item.text)}
            >
              <View className="items-center">
                <Ionicons name={item.icon} size={24} color={Colors.primary[500]} className="mb-3" />
                <Text 
                  className="text-xs font-medium text-[#1E293B] text-center mt-2"
                  numberOfLines={2}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                >
                  {item.text}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          {pair.length === 1 && <View className="flex-1 mx-2" />}
        </View>
      ))}
    </View>
  );
}