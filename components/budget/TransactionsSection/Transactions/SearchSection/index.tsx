import React from 'react';
import { View } from 'react-native';
import { Tag } from 'lucide-react-native';
import { SearchBar, QuickAccessButton } from '@/components/ui';
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

      <QuickAccessButton
        label={categoriesLabel}
        icon={<Tag size={20} color={Colors.primary[500]} />}
        onPress={onCategoriesPress}
        style={{ marginTop: 8 }}
      />
    </>
  );
}
