import React, { useEffect, useRef } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { MessageBubble } from '@/components/copilot/MessageBubble';
import { ChatInput } from '@/components/copilot/ChatInput';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
}

interface CopilotChatProps {
  messages: Message[];
  isTyping: boolean;
  onSendMessage: (message: string) => void;
  onTypingComplete: () => void;
}

export function CopilotChat({ messages, isTyping, onSendMessage, onTypingComplete }: CopilotChatProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.sender === 'assistant') {
      onTypingComplete();
    }

    const timeout = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    return () => clearTimeout(timeout);
  }, [messages, onTypingComplete]);

  return (
    <KeyboardAvoidingView 
      className="flex-1" 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView 
        ref={scrollViewRef} 
        className="flex-1" 
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }} 
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isTyping && (
          <MessageBubble 
            message={{ id: 'typing', content: '...', sender: 'assistant' }} 
          />
        )}
      </ScrollView>

      <ChatInput onSendMessage={onSendMessage} />
    </KeyboardAvoidingView>
  );
}