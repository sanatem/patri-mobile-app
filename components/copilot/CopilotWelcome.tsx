import React from 'react';
import { Text } from 'react-native';
import { SuggestionButtons } from '@/components/copilot/SuggestionButtons';
import { Container } from '@/components/ui/Container';
import { copilotWelcomeStyles } from '@/styles/copilot/CopilotWelcome.styles';
import { COPILOT_SUGGESTIONS } from '@/constants/AppConstants';

interface CopilotWelcomeProps {
  user: any;
  onSuggestionPress: (suggestion: string) => void;
}

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
          suggestions={COPILOT_SUGGESTIONS.WELCOME}
          onSuggestionPress={onSuggestionPress}
        />
      </Container>
    </Container>
  );
}