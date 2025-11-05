import React from 'react';
import { Container } from '@/components/ui';
import ForYouCarousel from '@/components/common/ForYouCarousel';

interface InsightsCarouselSectionProps {
  totalExpenses: number;
}

export function InsightsCarouselSection({ totalExpenses }: InsightsCarouselSectionProps) {
  return (
    <Container variant="content">
      <ForYouCarousel totalExpenses={totalExpenses} />
    </Container>
  );
}
