import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Settings } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LABELS } from '@/constants/AppConstants';
import {
  Header,
  Container,
} from '@/components/ui';
import { PlanningCarousel } from '@/components/planning';
import AdvisorSection from '@/components/planning/AdvisorSection';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';

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
        <Header
          title={LABELS.PLANNING.TITLE}
          subtitle={LABELS.PLANNING.SUBTITLE}
          variant="transparent"
          titleClassName="text-white font-bold"
          subtitleClassName="text-white"
          rightAction={
            <TouchableOpacity onPress={() => router.push('/settings')}>
              <Settings size={24} color={Colors.primary[500]} />
            </TouchableOpacity>
          }
        />
        <ScrollView className="flex-1 mx-2" showsVerticalScrollIndicator={false} style={{ marginTop: 10 }}>
          <AdvisorSection onSchedule={handleSchedulePress} onChat={handleChatPress} />
          <PlanningCarousel onCardPress={handleCarouselCardPress} onAIPress={handleAIPress} />
        </ScrollView>
    </Container>
  );
}
