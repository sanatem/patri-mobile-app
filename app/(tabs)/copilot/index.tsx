import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { MessageSquare, ChevronLeft, Settings } from 'lucide-react-native';
import { useAuth } from '@/providers/AuthProvider';
import { useCopilotChat } from '@/hooks/useCopilotHooks';
import { useRouter } from 'expo-router';
import { Header } from '@/components/ui/Header';
import { CopilotWelcome } from '@/components/copilot/CopilotWelcome';
import { CopilotChat } from '@/components/copilot/CopilotChat';
import { Container } from '@/components/ui/Container';

export default function CopilotScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [isChatActive, setIsChatActive] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const { messages, appendMessage, clearMessages } = useCopilotChat();

  const handleStartChat = async (message: string) => {
    setIsTyping(true);
    setIsChatActive(true);
    await appendMessage(message);
  };

  const handleGoBack = () => {
    setIsTyping(false);
    clearMessages();
    setIsChatActive(false);
  };

  const handleSendMessage = async (message: string) => {
    setIsTyping(true);
    await appendMessage(message);
  };

  const leftAction = (
    <View className="flex-row items-center">
      {isChatActive && (
        <TouchableOpacity onPress={handleGoBack} className="mr-2 p-1">
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
      )}
      <MessageSquare size={24} color="#FF6503" />
    </View>
  );

  const rightAction = (
    <TouchableOpacity 
      onPress={() => router.push('/settings')} 
      className="w-10 h-10 rounded-full justify-center items-center"
    >
      <Settings size={24} color="#fff" />
    </TouchableOpacity>
  );

  return (
    <Container variant="secondaryPage">
      <Header 
        title="Copiloto"
        leftAction={leftAction}
        rightAction={rightAction}
        titleClassName="text-lg font-semibold text-white"
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
        />
      )}
    </Container>
  );
}
