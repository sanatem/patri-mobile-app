import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface SuggestionButtonsProps {
  suggestions: string[];
  onSuggestionPress: (suggestion: string) => void;
}

export function SuggestionButtons({ suggestions, onSuggestionPress }: SuggestionButtonsProps) {
  const pairs = [];
  for (let i = 0; i < suggestions.length; i += 2) {
    pairs.push(suggestions.slice(i, i + 2));
  }

  return (
    <View className="w-full">
      {pairs.map((pair, pairIndex) => (
        <View key={pairIndex} className="flex-row justify-between mb-4">
          {pair.map((text) => (
            <TouchableOpacity
              key={text}
              className="bg-gray-50 py-3 px-3 rounded-full flex-1 mx-2"
              onPress={() => onSuggestionPress(text)}
            >
              <Text 
                className="text-sm font-medium text-gray-700 text-center"
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                {text}
              </Text>
            </TouchableOpacity>
          ))}
          {pair.length === 1 && <View className="flex-1 mx-2" />}
        </View>
      ))}
    </View>
  );
}