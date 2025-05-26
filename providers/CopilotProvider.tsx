import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Tipos para el sistema de CopilotKit
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export interface CopilotAction {
  name: string;
  description: string;
  parameters: Array<{
    name: string;
    type: string;
    description: string;
    required?: boolean;
  }>;
  handler: (params: any) => void | Promise<void>;
}

export interface CopilotReadableData {
  description: string;
  value: any;
}

interface CopilotContextType {
  // Estado del chat
  messages: Message[];
  isLoading: boolean;
  
  // Funciones del chat
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  
  // Sistema de acciones
  actions: Map<string, CopilotAction>;
  registerAction: (action: CopilotAction) => void;
  unregisterAction: (name: string) => void;
  
  // Sistema de datos legibles
  readableData: Map<string, CopilotReadableData>;
  makeReadable: (key: string, data: CopilotReadableData) => void;
  removeReadable: (key: string) => void;
  
  // Configuración
  instructions?: string;
}

const CopilotContext = createContext<CopilotContextType | undefined>(undefined);

interface CopilotProviderProps {
  children: ReactNode;
  instructions?: string;
  apiEndpoint?: string;
}

export function CopilotProvider({ 
  children, 
  instructions = "Eres un asistente financiero útil y conocedor. Ayuda a los usuarios con sus consultas sobre finanzas personales.",
  apiEndpoint = "/api/chat"
}: CopilotProviderProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actions] = useState(new Map<string, CopilotAction>());
  const [readableData] = useState(new Map<string, CopilotReadableData>());

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Agregar mensaje del usuario
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Preparar contexto para la IA
      const context = {
        messages: [...messages, userMessage],
        actions: Array.from(actions.values()).map(action => ({
          name: action.name,
          description: action.description,
          parameters: action.parameters,
        })),
        readableData: Array.from(readableData.entries()).map(([key, data]) => ({
          key,
          description: data.description,
          value: data.value,
        })),
        instructions,
      };

      // Simular respuesta de IA (en una implementación real, harías una llamada a tu API)
      const response = await generateAIResponse(context);
      
      // Procesar respuesta
      if (response.action) {
        // Ejecutar acción si la IA decidió usar una
        const action = actions.get(response.action.name);
        if (action) {
          await action.handler(response.action.parameters);
        }
      }

      // Agregar respuesta de la IA
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.content,
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Mensaje de error
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.',
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, actions, readableData, instructions]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const registerAction = useCallback((action: CopilotAction) => {
    actions.set(action.name, action);
  }, [actions]);

  const unregisterAction = useCallback((name: string) => {
    actions.delete(name);
  }, [actions]);

  const makeReadable = useCallback((key: string, data: CopilotReadableData) => {
    readableData.set(key, data);
  }, [readableData]);

  const removeReadable = useCallback((key: string) => {
    readableData.delete(key);
  }, [readableData]);

  const value: CopilotContextType = {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    actions,
    registerAction,
    unregisterAction,
    readableData,
    makeReadable,
    removeReadable,
    instructions,
  };

  return (
    <CopilotContext.Provider value={value}>
      {children}
    </CopilotContext.Provider>
  );
}

// Hook para usar el contexto
export function useCopilot() {
  const context = useContext(CopilotContext);
  if (context === undefined) {
    throw new Error('useCopilot must be used within a CopilotProvider');
  }
  return context;
}

// Función simulada para generar respuestas de IA
async function generateAIResponse(context: any): Promise<{ content: string; action?: { name: string; parameters: any } }> {
  // En una implementación real, aquí harías una llamada a tu API de IA
  // Por ahora, simularemos respuestas inteligentes basadas en el contexto
  
  const userMessage = context.messages[context.messages.length - 1].content.toLowerCase();
  
  // Detectar si el usuario está pidiendo acciones específicas
  if (userMessage.includes('agregar') || userMessage.includes('añadir')) {
    return {
      content: 'He procesado tu solicitud y he actualizado la información correspondiente.',
      action: {
        name: 'addFinancialData',
        parameters: { type: 'expense', amount: 100 }
      }
    };
  }
  
  if (userMessage.includes('inversiones') || userMessage.includes('invertir')) {
    return {
      content: 'Basado en tu perfil financiero, te recomendaría considerar una cartera diversificada con 60% en fondos indexados, 30% en renta fija, y 10% en activos alternativos. Esto se alinea con tu horizonte de inversión a largo plazo y tu tolerancia al riesgo moderada.'
    };
  }
  
  if (userMessage.includes('ahorro') || userMessage.includes('ahorrar')) {
    return {
      content: 'Para mejorar tus ahorros, considera implementar la regla 50/30/20: destina 50% de tus ingresos a necesidades básicas, 30% a deseos personales, y 20% a ahorro e inversión. Según tus datos actuales, podrías aumentar tu ahorro mensual haciendo pequeños ajustes en tus gastos discrecionales.'
    };
  }
  
  if (userMessage.includes('gasto') || userMessage.includes('gastos')) {
    return {
      content: 'Analizando tus patrones de gasto, he identificado que tus principales categorías de gasto son Vivienda (42%), Transporte (28%) y Ocio (15%). Tu gasto en Ocio está un 22% por encima del promedio para tu perfil de ingresos. Podrías considerar reducir este rubro para mejorar tu balance financiero mensual.'
    };
  }
  
  // Respuesta por defecto
  return {
    content: 'Gracias por tu mensaje. Como tu copiloto financiero, estoy aquí para ayudarte con cualquier consulta sobre tus finanzas personales, presupuesto, inversiones o planificación. ¿En qué más puedo asistirte hoy?'
  };
} 