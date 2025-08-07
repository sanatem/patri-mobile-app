import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ChevronLeft, Settings } from 'lucide-react-native';
import { useAuth } from '@/providers/AuthProvider';
import { useCopilotChat } from '@/hooks/copilot/useCopilotHooks';
import { useRouter } from 'expo-router';
import { Header } from '@/components/ui/Header';
import { CopilotWelcome } from '@/components/copilot/CopilotWelcome';
import { CopilotChat } from '@/components/copilot/CopilotChat';
import { Container } from '@/components/ui/Container';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

export default function CopilotScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const [isChatActive, setIsChatActive] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSuggestionsOnly, setIsSuggestionsOnly] = useState(false);

  const { messages, appendMessage, clearMessages } = useCopilotChat();

  const handleStartChat = async (message: string) => {
    setIsTyping(true);
    setIsChatActive(true);
    setIsSuggestionsOnly(true);
    await appendMessage(message);
  };

  const handleGoBack = () => {
    setIsTyping(false);
    clearMessages();
    setIsChatActive(false);
    setIsSuggestionsOnly(false);
  };

  const handleSendMessage = async (message: string) => {
    setIsTyping(true);
    setIsSuggestionsOnly(false);
    await appendMessage(message);
  };

  const handleSuggestionPress = async (suggestion: string) => {
    setIsTyping(true);
    await appendMessage(suggestion);
  };

  const leftAction = (
    <View className="flex-row items-center">
      {isChatActive && (
        <TouchableOpacity onPress={handleGoBack} className="mr-2 p-1">
          <ChevronLeft size={24} color={Colors.primary[500]} />
        </TouchableOpacity>
      )}
    </View>
  );

  const rightAction = (
    <TouchableOpacity 
      onPress={() => router.push('/settings')} 
      className="w-10 h-10 rounded-full justify-center items-center"
    >
      <Settings size={24} color={Colors.primary[500]} />
    </TouchableOpacity>
  );

  return (
    <Container variant="secondaryPage">
      <Header 
        title={t('copilot.title')}
        leftAction={leftAction}
        rightAction={rightAction}
      />

      {!isChatActive ? (
        <CopilotWelcome 
          user={user}
          onSuggestionPress={handleStartChat}
        />
      ) : (
        <CopilotChat
          messages={messages}
          isTyping={isTyping}
          onSendMessage={handleSendMessage}
          onTypingComplete={() => setIsTyping(false)}
          isSuggestionsOnly={isSuggestionsOnly}
          onSuggestionPress={handleSuggestionPress}
        />
      )}
    </Container>
  );
}
