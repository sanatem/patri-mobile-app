import React, { useState, useRef } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Send } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import Colors from '@/constants/Colors';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const inputRef = useRef<any>(null);

  const handleSend = () => {
    if (!message.trim()) return;
    const messageToSend = message.trim();
    setMessage('');
    onSendMessage(messageToSend);
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.gray[100],
        alignItems: 'flex-end',
      }}
    >
      <View style={{ flex: 1, position: 'relative', justifyContent: 'center' }}>
        <Input
          value={message}
          onChangeText={setMessage}
          placeholder="¿En qué te puedo ayudar hoy?"
          placeholderTextColor="#9CA3AF"
          multiline
          style={{ paddingRight: 48 }}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!message.trim()}
          style={{
            position: 'absolute',
            right: 8,
            top: 0,
            bottom: 20,
            marginVertical: 'auto',
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: message.trim() ? Colors.secondary[500] : Colors.gray[100],
          }}
        >
          <Send size={22} color={message.trim() ? 'white' : '#9CA3AF'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}