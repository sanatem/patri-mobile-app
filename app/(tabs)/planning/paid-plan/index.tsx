import { ScrollView, Alert } from 'react-native';
import { LABELS } from '@/constants/AppConstants';
import {
  Header,
  Container,
} from '@/components/ui';
import { PlanningCarousel } from '@/components/planning/paid-plan';
import AdvisorSection from '@/components/planning/paid-plan/AdvisorSection';
import { PlanningCard } from '@/types/planning';

export default function PaidPlan() {

  const handleScheduleMeeting = () => {
    Alert.alert('Funcionalidad en desarrollo', 'Esta función estará disponible próximamente');
  };

  const handleStartChat = () => {
    Alert.alert('Funcionalidad en desarrollo', 'Esta función estará disponible próximamente');
  };

  const handleCardPress = (card: PlanningCard) => {
    Alert.alert('Funcionalidad en desarrollo', 'Esta función estará disponible próximamente');
  };

  const handleAIRequest = (card: PlanningCard) => {
    Alert.alert('Funcionalidad en desarrollo', 'Esta función estará disponible próximamente');
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
        <AdvisorSection onSchedule={handleScheduleMeeting} onChat={handleStartChat} />
        {false && <PlanningCarousel onCardPress={handleCardPress} onAIPress={handleAIRequest} />}
      </ScrollView>
    </Container>
  );
}
