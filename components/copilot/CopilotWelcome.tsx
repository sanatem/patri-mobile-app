import React from 'react';
import { View, Text } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { SuggestionButtons } from '@/components/copilot/SuggestionButtons';
import { Container } from '@/components/ui/Container';
import { copilotWelcomeStyles } from '@/styles/copilot/CopilotWelcome.styles';

interface CopilotWelcomeProps {
  user: any;
  onSuggestionPress: (suggestion: string) => void;
}

const DEFAULT_SUGGESTIONS = [
  'Ver mis inversiones',
  'Hablar con un asesor',
  'Agendar reunión',
  'Conocer mi patrimonio'
];

export function CopilotWelcome({ user, onSuggestionPress }: CopilotWelcomeProps) {
  const userName = user?.isGuest ? 'Invitado' : user?.name?.split(' ')[0] || 'Invitado';

  return (
    <Container variant="secondaryPage" style={copilotWelcomeStyles.container}>
      <Text className="font-bold text-primary-500 mb-3 mt-5 text-center" style={copilotWelcomeStyles.title}>
        Hola {userName}
      </Text>
      <Text className="text-base font-regular text-gray-500 text-center mb-8 leading-6">
        Soy tu Copiloto financiero. ¿Listo para empezar a planificar tu futuro?
      </Text>
      <Container variant="section">
      <View className="bg-gray-50 rounded-2xl p-5 flex-row items-center justify-between mb-6 w-full">
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-800 mb-1" style={copilotWelcomeStyles.assistantTitle}>
            Asistente de Patrimore
          </Text>
          <Text className="text-sm font-regular text-gray-600 leading-5" style={copilotWelcomeStyles.assistantDescription}>
            Toca el botón para descubrir cómo puede ayudarte día a día.
          </Text>
        </View>
        <ChevronRight size={40} color="#9CA3AF" style={copilotWelcomeStyles.chevronIcon} />
      </View>
      </Container>
      <Container variant="secondaryPage" style={copilotWelcomeStyles.container}>
      <SuggestionButtons 
        suggestions={DEFAULT_SUGGESTIONS}
        onSuggestionPress={onSuggestionPress}
      />
       </Container>
    </Container>
  );
}