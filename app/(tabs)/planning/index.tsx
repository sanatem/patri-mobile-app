import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Settings } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LABELS } from '@/constants/AppConstants';
import {
  Header,
  Container,
} from '@/components/ui';

import { AdvisorCard, PlanningCarousel } from '@/components/planning';

export default function PlanningScreen() {
  const router = useRouter();

  const handleSchedulePress = () => {
    console.log('Programar reunión');
  };

  const handleChatPress = () => {
    console.log('Iniciar chat');
  };

  const handleCarouselCardPress = (card: any) => {
    console.log('Plan seleccionado:', card.title, card.price);
  };

  const handleAIPress = (card: any) => {
    console.log('IA solicitada para:', card.title);
  };

  return (
    <Container variant="secondaryPage">
      <Container variant="content" className="bg-primary-500">
        <Header
          title={LABELS.PLANNING.TITLE}
          subtitle={LABELS.PLANNING.SUBTITLE}
          variant="transparent"
          titleClassName="text-white font-bold"
          subtitleClassName="text-white"
          rightAction={
            <TouchableOpacity onPress={() => router.push('/settings')}>
              <Settings size={24} color="white" />
            </TouchableOpacity>
          }
        />
      </Container>
      <Container variant="content" className="bg-slate-50 rounded-t-3xl flex-1 mt-6" style={{ padding: 20 }}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <AdvisorCard onSchedule={handleSchedulePress} onChat={handleChatPress} />
          <PlanningCarousel onCardPress={handleCarouselCardPress} onAIPress={handleAIPress} />
        </ScrollView>
      </Container>
    </Container>
  );
}
