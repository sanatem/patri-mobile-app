import React from 'react';
import { View, Text } from 'react-native';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
}

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user';
  
  return (
    <View
      className={`max-w-[80%] mb-4 p-3 rounded-2xl ${
        isUser 
          ? 'self-end bg-primary-500 rounded-br-md' 
          : 'self-start bg-gray-100 rounded-bl-md'
      }`}
    >
      <Text 
        className={`text-base font-regular leading-6 ${
          isUser ? 'text-white' : 'text-gray-800'
        }`}
      >
        {message.content}
      </Text>
    </View>
  );
}