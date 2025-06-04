import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { MessageSquare, Send, ChevronRight, ChevronLeft, Settings } from 'lucide-react-native';
import { useAuth } from '@/providers/AuthProvider';
import { useCopilotChat, useCopilotSuggestions } from '@/hooks/useCopilotHooks';
import { useRouter } from 'expo-router';

export default function CopilotScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isChatActive, setIsChatActive] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const { messages, appendMessage, clearMessages } = useCopilotChat();
  const { suggestions } = useCopilotSuggestions();

  const scrollViewRef = useRef<ScrollView>(null);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const messageToSend = message.trim();
    setMessage('');
    setIsTyping(true);
    setIsChatActive(true);
    await appendMessage(messageToSend);
  };

  const handleSuggestion = async (suggestion: string) => {
    setIsTyping(true);
    setIsChatActive(true);
    await appendMessage(suggestion);
  };

  const handleGoBack = () => {
    setIsTyping(false);
    setMessage('');
    clearMessages();
    setIsChatActive(false);
  };

  useEffect(() => {
    if (!isChatActive) return;

    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.sender === 'assistant') {
      setIsTyping(false);
    }

    const timeout = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    return () => clearTimeout(timeout);
  }, [messages, isChatActive]);

  return (
    <View className="flex-1 bg-white">
      <View className="pt-16 px-4 pb-4 bg-white border-b border-gray-100 flex-row justify-between items-center">
        <View className="flex-row items-center">
          {isChatActive && (
            <TouchableOpacity onPress={handleGoBack} className="mr-2 p-1">
              <ChevronLeft size={24} color="#FF6503" />
            </TouchableOpacity>
          )}
          <View className="flex-row items-center">
            <MessageSquare size={24} color="#FF6503" />
            <Text className="text-lg font-semibold text-gray-800 ml-2">Copiloto</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.push('/settings')} className="w-10 h-10 rounded-full justify-center items-center">
          <Settings size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {!isChatActive ? (
        <View className="flex-1 p-6 justify-center items-center">
          <Text className="text-3xl font-bold text-primary-500 mb-3 mt-5 text-center">
            Hola {user?.isGuest ? 'Invitado' : user?.name?.split(' ')[0] || 'Invitado'}
          </Text>
          <Text className="text-base font-regular text-gray-500 text-center mb-8 leading-6">
            Soy tu Copiloto financiero. ¿Listo para empezar a planificar tu futuro?
          </Text>

          <View className="bg-gray-50 rounded-2xl p-5 flex-row items-center justify-between mb-6 w-full">
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-800 mb-1">Asistente de Patrimore</Text>
              <Text className="text-sm font-regular text-gray-600 leading-5">
                Toca el botón para descubrir cómo puede ayudarte día a día.
              </Text>
            </View>
            <ChevronRight size={24} color="#9CA3AF" />
          </View>

          <View className="flex-row flex-wrap justify-center gap-2">
            {[ 'Ver mis inversiones', 'Hablar con un asesor', 'Agendar reunión', 'Conocer mi patrimonio' ].map((text) => (
              <TouchableOpacity
                key={text}
                className="bg-gray-50 px-4 py-3 rounded-full mx-1 mb-2"
                onPress={() => handleSuggestion(text)}
              >
                <Text className="text-sm font-medium text-gray-700">{text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
          <ScrollView ref={scrollViewRef} className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
            {messages.map((msg) => (
              <View
                key={msg.id}
                className={`max-w-[80%] mb-4 p-3 rounded-2xl ${msg.sender === 'user' ? 'self-end bg-primary-500 rounded-br-md' : 'self-start bg-gray-100 rounded-bl-md'}`}
              >
                <Text className={`text-base font-regular leading-6 ${msg.sender === 'user' ? 'text-white' : 'text-gray-800'}`}>{msg.content}</Text>
              </View>
            ))}

            {isTyping && (
              <View className="max-w-[80%] mb-4 p-3 rounded-2xl self-start bg-gray-100 rounded-bl-md">
                <Text className="text-base font-regular leading-6 text-gray-800">...</Text>
              </View>
            )}
          </ScrollView>

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
              className={`w-10 h-10 rounded-full justify-center items-center ${message.trim() ? 'bg-primary-500' : 'bg-gray-200'}`}
              onPress={handleSendMessage}
              disabled={!message.trim()}
            >
              <Send size={20} color={message.trim() ? 'white' : '#9CA3AF'} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}
