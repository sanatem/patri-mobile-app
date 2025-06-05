import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Settings } from 'lucide-react-native';
import { AdvisorCard, ExpertCard, BenefitsCard, PlanningCarousel } from '@/components/planning';
import { useRouter } from 'expo-router';

export default function PlanningScreen() {
  const router = useRouter();

  const handleSchedulePress = () => {
    console.log('Programar reunión');
  };

  const handleChatPress = () => {
    console.log('Iniciar chat');
  };

  const handleExploreServicesPress = () => {
    console.log('Explorar servicios');
  };

  const handleTopicPress = (topic: string) => {
    console.log('Tema seleccionado:', topic);
  };

  const handleCarouselCardPress = (card: any) => {
    console.log('Plan seleccionado:', card.title, card.price);
  };

  const handleAIPress = (card: any) => {
    console.log('IA solicitada para:', card.title);
  };

  return (
    <View className="flex-1 bg-slate-50">
      <View className="pt-[50px] bg-primary-500 px-5 pb-6 rounded-b-3xl">
        <View className="flex-row items-center">
          <View className="flex-1">
            <Text className="text-white text-2xl font-bold text-center" style={{ marginTop: 30 }}>Planificación Financiera</Text>
            <Text className="text-white/80 text-sm font-medium text-center mt-1" style={{ fontFamily: 'Poppins-Medium' }}>Tu camino hacia el éxito financiero</Text>
          </View>
          <TouchableOpacity className="p-2" onPress={() => router.push('/settings')}>
            <Settings size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <AdvisorCard onSchedule={handleSchedulePress} onChat={handleChatPress} />

        <PlanningCarousel onCardPress={handleCarouselCardPress} onAIPress={handleAIPress} />

        <View className="h-5" />
      </ScrollView>
    </View>
  );
}
