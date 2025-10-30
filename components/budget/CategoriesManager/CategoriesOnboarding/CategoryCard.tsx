import { View, Text, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface CategoryCardProps {
  category: any;
  isSelected: boolean;
  onToggle: () => void;
  currentLang: string;
}

export function CategoryCard({ category, isSelected, onToggle, currentLang }: CategoryCardProps) {
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
        borderColor: Colors.gray[100],
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
      activeOpacity={0.7}
    >
      <View
        style={{
          width: 48,
          height: 48,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Text style={{ fontSize: 32 }}>{category.emoji}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text
          className="font-medium"
          style={{
            fontSize: 16,
            color: isSelected ? Colors.primary[700] : Colors.gray[900],
          }}
        >
          {category.name[currentLang as keyof typeof category.name] || category.name.es}
        </Text>
      </View>

      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: isSelected ? Colors.primary[500] : Colors.gray[100],
          backgroundColor: isSelected ? Colors.primary[500] : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isSelected && (
          <Check size={14} color="white" strokeWidth={3} />
        )}
      </View>
    </TouchableOpacity>
  );
}
