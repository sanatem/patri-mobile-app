import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Colors from '@/constants/Colors';
import { AdvisorCard, ExpertCard, BenefitsCard, PlanningCarousel } from '@/components/planning';

export default function PlanningScreen() {
  const handleSchedulePress = () => {
    // Aquí puedes agregar la lógica para programar una reunión
    console.log('Programar reunión');
  };

  const handleChatPress = () => {
    // Aquí puedes agregar la lógica para iniciar un chat
    console.log('Iniciar chat');
  };

  const handleExploreServicesPress = () => {
    // Aquí puedes agregar la lógica para explorar servicios
    console.log('Explorar servicios');
  };

  const handleTopicPress = (topic: string) => {
    // Aquí puedes agregar la lógica para navegar a un tema específico
    console.log('Tema seleccionado:', topic);
  };

  const handleCarouselCardPress = (card: any) => {
    // Aquí puedes agregar la lógica para cuando se selecciona una card del carrusel
    console.log('Plan seleccionado:', card.title, card.price);
  };

  const handleAIPress = (card: any) => {
    // Aquí puedes agregar la lógica para cuando se presiona el botón de IA
    console.log('IA solicitada para:', card.title);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerGradient}>
          <Text style={styles.headerTitle}>Planificación Financiera</Text>
          <Text style={styles.headerSubtitle}>Tu camino hacia el éxito financiero</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <AdvisorCard
          onSchedule={handleSchedulePress}
          onChat={handleChatPress}
        />

        <PlanningCarousel 
          onCardPress={handleCarouselCardPress} 
          onAIPress={handleAIPress}
        />
        
        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 50,
  },
  headerGradient: {
    backgroundColor: Colors.primary[500],
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#ffffff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  bottomSpace: {
    height: 20,
  },
});