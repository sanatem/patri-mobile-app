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
              <Settings size={24} color="white" />
            </TouchableOpacity>
          }
        />
        <LinearGradient
          colors={['#FF6503', '#E55A02', '#CC5200']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ marginTop: -10, marginBottom: 10, paddingHorizontal: 8, paddingVertical: 18, borderBottomLeftRadius: 25, borderBottomRightRadius: 25, height: 50 }}
        >
           </LinearGradient>
        <ScrollView className="flex-1 mx-2" showsVerticalScrollIndicator={false} style={{ marginTop: -40 }}>
          <AdvisorSection onSchedule={handleSchedulePress} onChat={handleChatPress} />
          <PlanningCarousel onCardPress={handleCarouselCardPress} onAIPress={handleAIPress} />
        </ScrollView>
    </Container>
  );
}
