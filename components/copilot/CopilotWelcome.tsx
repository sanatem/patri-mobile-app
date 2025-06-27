import React from 'react';
import { View, Text } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { SuggestionButtons } from '@/components/copilot/SuggestionButtons';
import { Container } from '@/components/ui/Container';
import { copilotWelcomeStyles } from '@/styles/copilot/CopilotWelcome.styles';
import { Ionicons } from '@expo/vector-icons';

interface CopilotWelcomeProps {
  user: any;
  onSuggestionPress: (suggestion: string) => void;
}

const DEFAULT_SUGGESTIONS = [
  {
    text: '¿Cuáles son mis gastos este mes?',
    icon: 'wallet-outline'
  },
  {
    text: '¿Cómo va mi presupuesto?',
    icon: 'stats-chart-outline'
  },
  {
    text: '¿Cuánto dinero tengo invertido?',
    icon: 'pie-chart-outline'
  },
  {
    text: '¿Cuál es el resumen de mi patrimonio?',
    icon: 'person-outline'
  }
];

export function CopilotWelcome({ user, onSuggestionPress }: CopilotWelcomeProps) {
  const userName = user?.isGuest ? 'Invitado' : user?.name?.split(' ')[0] || 'Invitado';

  return (
    <Container variant="secondaryPage" style={copilotWelcomeStyles.container}>
      <Text className="font-bold text-primary-500 mb-3 mt-5 text-center" style={copilotWelcomeStyles.title}>
        Hola {userName}
      </Text>
      <Text className="text-base font-regular text-gray-500 text-center mb-10 leading-6">
        Soy tu Copiloto financiero. ¿Listo para empezar a planificar tu futuro?
      </Text>
      <Container variant="secondaryPage" style={copilotWelcomeStyles.container}>
        <SuggestionButtons 
          suggestions={DEFAULT_SUGGESTIONS as Array<{
            text: string;
            icon: keyof typeof Ionicons.glyphMap;
          }>}
          onSuggestionPress={onSuggestionPress}
        />
      </Container>
    </Container>
  );
}