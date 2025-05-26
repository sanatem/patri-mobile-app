import { useEffect, useCallback } from 'react';
import { useCopilot, CopilotAction, CopilotReadableData } from '@/providers/CopilotProvider';

// Hook para registrar acciones que el copiloto puede ejecutar
export function useCopilotAction(action: CopilotAction) {
  const { registerAction, unregisterAction } = useCopilot();

  useEffect(() => {
    registerAction(action);
    
    return () => {
      unregisterAction(action.name);
    };
  }, [action, registerAction, unregisterAction]);
}

// Hook para hacer datos legibles por el copiloto
export function useCopilotReadable(data: CopilotReadableData) {
  const { makeReadable, removeReadable } = useCopilot();
  const key = `readable_${Date.now()}_${Math.random()}`;

  useEffect(() => {
    makeReadable(key, data);
    
    return () => {
      removeReadable(key);
    };
  }, [data, makeReadable, removeReadable, key]);
}

// Hook para el chat del copiloto
export function useCopilotChat() {
  const { messages, isLoading, sendMessage, clearMessages } = useCopilot();

  const appendMessage = useCallback((content: string) => {
    return sendMessage(content);
  }, [sendMessage]);

  return {
    messages,
    isLoading,
    appendMessage,
    clearMessages,
    sendMessage,
  };
}

// Hook para obtener sugerencias del copiloto
export function useCopilotSuggestions() {
  const suggestions = [
    "¿Cómo puedo ahorrar más dinero?",
    "Muéstrame mis gastos del mes",
    "¿Qué inversiones me recomiendas?",
    "Ayúdame a crear un presupuesto",
    "Analiza mis patrones de gasto"
  ];

  return { suggestions };
}

// Hook para autocompletado inteligente
export function useCopilotAutocompletion(config: {
  textareaPurpose: string;
  value: string;
  enabled: boolean;
}) {
  const generateSuggestion = useCallback((text: string) => {
    if (!config.enabled || !text.trim()) return '';
    
    // Simulación de autocompletado basado en el propósito
    if (config.textareaPurpose.includes('presupuesto')) {
      if (text.toLowerCase().includes('gasto')) {
        return 'gastos mensuales de alimentación: $300,000';
      }
      if (text.toLowerCase().includes('ingreso')) {
        return 'ingresos fijos mensuales: $2,500,000';
      }
    }
    
    if (config.textareaPurpose.includes('inversión')) {
      if (text.toLowerCase().includes('riesgo')) {
        return 'riesgo moderado con diversificación en fondos indexados';
      }
      if (text.toLowerCase().includes('plazo')) {
        return 'plazo de inversión a largo plazo (5-10 años)';
      }
    }
    
    return '';
  }, [config]);

  return { generateSuggestion };
} 