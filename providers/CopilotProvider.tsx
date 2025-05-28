import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { openAIService } from '@/services/openai';

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
  instructions = 'Eres un asistente financiero útil y conocedor. Ayuda a los usuarios con sus consultas sobre finanzas personales.',
  apiEndpoint = '/api/chat',
}: CopilotProviderProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actions] = useState(new Map<string, CopilotAction>());
  const [readableData] = useState(new Map<string, CopilotReadableData>());

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      // Agregar mensaje del usuario
      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        sender: 'user',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        // Preparar contexto para OpenAI
        const context = {
          messages: [...messages, userMessage],
          actions: Array.from(actions.values()).map((action) => ({
            name: action.name,
            description: action.description,
            parameters: action.parameters,
          })),
          readableData: Array.from(readableData.entries()).map(
            ([key, data]) => ({
              key,
              description: data.description,
              value: data.value,
            })
          ),
          instructions,
        };

        // Llamar a OpenAI en lugar de la función simulada
        const response = await openAIService.sendMessage(context);

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

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error('Error sending message:', error);

        // Mensaje de error
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content:
            'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.',
          sender: 'assistant',
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, actions, readableData, instructions]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const registerAction = useCallback(
    (action: CopilotAction) => {
      actions.set(action.name, action);
    },
    [actions]
  );

  const unregisterAction = useCallback(
    (name: string) => {
      actions.delete(name);
    },
    [actions]
  );

  const makeReadable = useCallback(
    (key: string, data: CopilotReadableData) => {
      readableData.set(key, data);
    },
    [readableData]
  );

  const removeReadable = useCallback(
    (key: string) => {
      readableData.delete(key);
    },
    [readableData]
  );

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
    <CopilotContext.Provider value={value}>{children}</CopilotContext.Provider>
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
