import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight, Tag } from 'lucide-react-native';
import { SearchBar } from '@/components/ui';
import { SkeletonBase } from '@/components/ui/SkeletonBase';
import Colors from '@/constants/Colors';

interface SearchSectionProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  searchPlaceholder: string;
  onCategoriesPress: () => void;
  categoriesLabel: string;
  isLoading: boolean;
}

export function SearchSection({
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  onCategoriesPress,
  categoriesLabel,
  isLoading
}: SearchSectionProps) {
  if (isLoading) {
    return (
      <>
        <SkeletonBase
          width={380}
          height={56}
          x={0}
          y={0}
          rows={1}
          rowHeight={56}
          rowWidth={380}
          borderRadius={16}
        />
        <SkeletonBase
          width={380}
          height={56}
          x={0}
          y={0}
          rows={1}
          rowHeight={56}
          rowWidth={380}
          borderRadius={12}
          style={{ marginTop: 12 }}
        />
      </>
    );
  }

  return (
    <>
      <SearchBar
        placeholder={searchPlaceholder}
        value={searchQuery}
        onChangeText={onSearchChange}
      />

      <TouchableOpacity
        onPress={onCategoriesPress}
        style={{
          backgroundColor: 'white',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: Colors.gray[100],
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 12,
        }}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Tag size={20} color={Colors.primary[500]} style={{ marginRight: 12 }} />
          <Text className="text-base font-medium" style={{ color: Colors.primary[600] }}>
            {categoriesLabel}
          </Text>
        </View>
        <ChevronRight size={20} color={Colors.primary[500]} />
      </TouchableOpacity>
    </>
  );
}
