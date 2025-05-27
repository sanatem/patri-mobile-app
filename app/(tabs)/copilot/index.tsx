import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { MessageSquare, Send, ChevronRight, CircleAlert as AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';
import { useCopilotChat, useCopilotAction, useCopilotReadable, useCopilotSuggestions } from '@/hooks/useCopilotHooks';
import { Message } from '@/providers/CopilotProvider';

export default function CopilotScreen() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  // Usar hooks de CopilotKit
  const { messages, isLoading, appendMessage, clearMessages } = useCopilotChat();
  const { suggestions } = useCopilotSuggestions();

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    await appendMessage(message);
    setMessage('');
    setShowSuggestions(false);
  };

  const handleSuggestion = async (suggestion: string) => {
    await appendMessage(suggestion);
    setShowSuggestions(false);
  };

  const getAssistantResponse = (userMessage: string): string => {
    // Simple response logic - in a real app this would connect to an AI service
    if (userMessage.toLowerCase().includes('inversiones')) {
      return 'Basado en tu perfil financiero, te recomendaría considerar una cartera diversificada con 60% en fondos indexados, 30% en renta fija, y 10% en activos alternativos. Esto se alinea con tu horizonte de inversión a largo plazo y tu tolerancia al riesgo moderada.';
    } else if (userMessage.toLowerCase().includes('ahorro')) {
      return 'Para mejorar tus ahorros, considera implementar la regla 50/30/20: destina 50% de tus ingresos a necesidades básicas, 30% a deseos personales, y 20% a ahorro e inversión. Según tus datos actuales, podrías aumentar tu ahorro mensual en aproximadamente $215,000 CLP haciendo pequeños ajustes en tus gastos discrecionales.';
    } else if (userMessage.toLowerCase().includes('gasto')) {
      return 'Analizando tus patrones de gasto, he identificado que tus principales categorías de gasto son Vivienda (42%), Transporte (28%) y Ocio (15%). Tu gasto en Ocio está un 22% por encima del promedio para tu perfil de ingresos. Podrías considerar reducir este rubro para mejorar tu balance financiero mensual.';
    } else {
      return 'Gracias por tu mensaje. Como tu copiloto financiero, estoy aquí para ayudarte con cualquier consulta sobre tus finanzas personales, presupuesto, inversiones o planificación. ¿En qué más puedo asistirte hoy?';
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <MessageSquare size={24} color={Colors.secondary[500]} />
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
          </View>
        </View>
      ) : (
        <ScrollView 
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
        >
          {messages.map((msg) => (
            <View 
              key={msg.id} 
              style={[
                styles.messageContainer,
                msg.sender === 'user' ? styles.userMessage : styles.assistantMessage
              ]}
            >
              <Text style={[
                styles.messageText,
                msg.sender === 'user' ? styles.userMessageText : styles.assistantMessageText
              ]}>
                {msg.content}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="En qué te puedo ayudar hoy?"
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity 
          style={[
            styles.sendButton,
            !message.trim() && styles.sendButtonDisabled
          ]}
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
    fontSize: 32,
    color: Colors.secondary[500],
    marginBottom: 16,
    textAlign: 'center',
  },
  welcomeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.gray[600],
    textAlign: 'center',
    marginBottom: 32,
  },
  assistantCard: {
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
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
    marginTop: 16,
  },
  suggestionButton: {
    backgroundColor: Colors.gray[100],
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