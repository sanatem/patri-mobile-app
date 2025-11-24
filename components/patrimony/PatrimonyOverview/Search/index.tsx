import React from 'react';
import { Animated } from 'react-native';
import { Container, SearchBar } from '@/components/ui';
import { SkeletonBase } from '@/components/ui/SkeletonBase';

interface SearchSectionProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  placeholder: string;
  showSkeletons: boolean;
  skeletonFadeAnim: Animated.Value;
}

export function SearchSection({
  searchQuery,
  onSearchChange,
  placeholder,
  showSkeletons,
  skeletonFadeAnim
}: SearchSectionProps) {
  if (showSkeletons) {
    return (
      <Container variant="content" className="mb-4">
        <Animated.View style={{ opacity: skeletonFadeAnim }}>
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
        </Animated.View>
      </Container>
    );
  }

  return (
    <Container variant="content" className="mb-4">
      <SearchBar
        placeholder={placeholder}
        value={searchQuery}
        onChangeText={onSearchChange}
      />
    </Container>
  );
}
