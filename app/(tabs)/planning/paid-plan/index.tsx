import { ScrollView } from 'react-native';
import { LABELS } from '@/constants/AppConstants';
import {
  Header,
  Container,
} from '@/components/ui';
import { PlanningCarousel } from '@/components/planning/paid-plan';
import AdvisorSection from '@/components/planning/paid-plan/AdvisorSection';


export default function PaidPlan() {

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
      />
      <ScrollView className="flex-1 mx-2" showsVerticalScrollIndicator={false} style={{ marginTop: 10 }}>
        <AdvisorSection onSchedule={handleSchedulePress} onChat={handleChatPress} />
        {false && <PlanningCarousel onCardPress={handleCarouselCardPress} onAIPress={handleAIPress} />}
      </ScrollView>
    </Container>
  );
}