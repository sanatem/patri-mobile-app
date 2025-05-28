import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  MessageSquare,
  Send,
  ChevronRight,
  CircleAlert as AlertCircle,
} from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';
import {
  useCopilotChat,
  useCopilotSuggestions,
} from '@/hooks/useCopilotHooks';

export default function CopilotScreen() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  const { messages, isLoading, appendMessage, clearMessages } = useCopilotChat();
  const { suggestions } = useCopilotSuggestions();

  const scrollViewRef = useRef<ScrollView>(null);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    setIsTyping(true);
    await appendMessage(message);
    setMessage('');
    setShowSuggestions(false);
  };

  const handleSuggestion = async (suggestion: string) => {
    setIsTyping(true);
    await appendMessage(suggestion);
    setShowSuggestions(false);
  };

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.sender === 'assistant') {
      setIsTyping(false);
    }

    const timeout = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    return () => clearTimeout(timeout);
  }, [messages]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <MessageSquare size={24} color={Colors.primary[500]} />
          <Text style={styles.headerTitle}>Copiloto</Text>
        </View>
        <TouchableOpacity style={styles.notificationBadge}>
          <AlertCircle size={24} color="#F59E0B" />
        </TouchableOpacity>
      </View>

      {messages.length === 0 ? (
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>
            Hola {user?.isGuest ? 'Invitado' : user?.name?.split(' ')[0] || 'Invitado'}
          </Text>

          <Text style={styles.welcomeText}>
            Soy tu Copiloto financiero. ¿Listo para empezar a planificar tu futuro?
          </Text>

          <View style={styles.assistantCard}>
            <View style={styles.assistantInfo}>
              <Text style={styles.assistantTitle}>Asistente de Patrimore</Text>
              <Text style={styles.assistantDescription}>
                Toca el botón para descubrir cómo puede ayudarte día a día.
              </Text>
            </View>
            <ChevronRight size={24} color={Colors.gray[400]} />
          </View>

          <View style={styles.suggestionContainer}>
            <TouchableOpacity
              style={styles.suggestionButton}
              onPress={() => handleSuggestion('Ver mis inversiones')}
            >
              <Text style={styles.suggestionText}>Ver mis inversiones</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.suggestionButton}
              onPress={() => handleSuggestion('Hablar con un asesor')}
            >
              <Text style={styles.suggestionText}>Hablar con un asesor</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.suggestionButton}
              onPress={() => handleSuggestion('Agendar reunión')}
            >
              <Text style={styles.suggestionText}>Agendar reunión</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.suggestionButton}
              onPress={() => handleSuggestion('Conocer mi patrimonio')}
            >
              <Text style={styles.suggestionText}>Conocer mi patrimonio</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageContainer,
                msg.sender === 'user' ? styles.userMessage : styles.assistantMessage,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  msg.sender === 'user'
                    ? styles.userMessageText
                    : styles.assistantMessageText,
                ]}
              >
                {msg.content}
              </Text>
            </View>
          ))}

          {isTyping && (
            <View style={[styles.messageContainer, styles.assistantMessage]}>
              <Text style={[styles.messageText, styles.assistantMessageText]}>
                ...
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="¿En qué te puedo ayudar hoy?"
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!message.trim()}
        >
          <Send size={20} color={message.trim() ? 'white' : Colors.gray[400]} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.gray[800],
    marginLeft: 8,
  },
  notificationBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 36,
    color: '#FF6A00',
    marginBottom: 12,
    marginTop: 20,
    textAlign: 'center',
  },
  welcomeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  assistantCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    width: '100%',
  },
  assistantInfo: {
    flex: 1,
  },
  assistantTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.gray[800],
    marginBottom: 4,
  },
  assistantDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.gray[600],
    lineHeight: 20,
  },
  suggestionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 8,
    gap: 8,
  },
  suggestionButton: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  suggestionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.gray[700],
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageContainer: {
    maxWidth: '80%',
    marginBottom: 16,
    padding: 12,
    borderRadius: 16,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary[500],
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.gray[100],
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: 'white',
  },
  assistantMessageText: {
    color: Colors.gray[800],
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: Colors.gray[50],
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.gray[800],
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.gray[200],
  },
});