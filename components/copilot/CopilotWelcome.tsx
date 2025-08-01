import React from 'react';
import { Text } from 'react-native';
import { SuggestionButtons } from '@/components/copilot/SuggestionButtons';
import { Container } from '@/components/ui/Container';
import { copilotWelcomeStyles } from '@/styles/copilot/CopilotWelcome.styles';
import { useTranslation } from 'react-i18next';
import { COPILOT_SUGGESTION_KEYS, COPILOT_SUGGESTION_ICONS } from '@/constants/AppConstants';

interface CopilotWelcomeProps {
  user: any;
  onSuggestionPress: (suggestion: string) => void;
}

export function CopilotWelcome({ user, onSuggestionPress }: CopilotWelcomeProps) {
  const { t } = useTranslation();
  const userName = user?.isGuest ? 'Invitado' : user?.name?.split(' ')[0] || 'Invitado';

  const suggestions = COPILOT_SUGGESTION_KEYS.map((key) => ({
    text: t(`copilot.suggestions.${key}`),
    icon: COPILOT_SUGGESTION_ICONS[key],
  }));

  return (
    <Container variant="secondaryPage" style={copilotWelcomeStyles.container}>
      <Text className="font-bold text-primary-500 mb-3 mt-5 text-center" style={copilotWelcomeStyles.title}>
        {t('copilot.welcomeTitle', { name: userName })}
      </Text>
      <Text className="text-base font-regular text-gray-500 text-center mb-10 leading-6">
        {t('copilot.welcomeSubtitle')}
      </Text>
      <Container variant="secondaryPage" style={copilotWelcomeStyles.container}>
        <SuggestionButtons 
          suggestions={suggestions}
          onSuggestionPress={onSuggestionPress}
        />
      </Container>
    </Container>
  );
}
