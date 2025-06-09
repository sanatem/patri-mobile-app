import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Send } from 'lucide-react-native';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) return;
    
    const messageToSend = message.trim();
    setMessage('');
    onSendMessage(messageToSend);
  };

  return (
    <View className="flex-row px-4 py-4 border-t border-gray-200 items-end">
      <TextInput
        className="flex-1 min-h-[40px] max-h-[120px] bg-gray-50 rounded-full px-4 py-2 mr-2 text-base font-regular text-gray-800"
        placeholder="¿En qué te puedo ayudar hoy?"
        placeholderTextColor="#9CA3AF"
        value={message}
        onChangeText={setMessage}
        multiline
      />
      <TouchableOpacity
        className={`w-10 h-10 rounded-full justify-center items-center ${
          message.trim() ? 'bg-primary-500' : 'bg-gray-200'
        }`}
        onPress={handleSend}
        disabled={!message.trim()}
      >
        <Send size={20} color={message.trim() ? 'white' : '#9CA3AF'} />
      </TouchableOpacity>
    </View>
  );
}