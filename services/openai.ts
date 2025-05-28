import OpenAI from 'openai';

// Configuración de OpenAI
const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true, // Solo para desarrollo, en producción usar un backend
});

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export interface CopilotContext {
  messages: Message[];
  actions: Array<{
    name: string;
    description: string;
    parameters: Array<{
      name: string;
      type: string;
      description: string;
      required?: boolean;
    }>;
  }>;
  readableData: Array<{
    key: string;
    description: string;
    value: any;
  }>;
  instructions: string;
}

export interface OpenAIResponse {
  content: string;
  action?: {
    name: string;
    parameters: any;
  };
}

export class OpenAIService {
  private systemPrompt: string;

  constructor() {
    this.systemPrompt = `Eres un asistente financiero inteligente llamado "Copiloto" para la aplicación Patrimore. Tu objetivo es ayudar a los usuarios con sus consultas sobre finanzas personales, inversiones, presupuestos y planificación financiera.

CARACTERÍSTICAS PRINCIPALES:
- Responde de manera profesional, amigable y clara
- Proporciona consejos financieros prácticos y basados en evidencia
- Analiza datos financieros cuando estén disponibles
- Sugiere acciones específicas cuando sea apropiado
- Mantén un tono conversacional pero experto

CONTEXTO FINANCIERO:
- Los usuarios pueden tener diferentes perfiles de riesgo
- Las recomendaciones deben ser personalizadas según la situación del usuario
- Enfócate en educación financiera y mejores prácticas
- Considera el mercado financiero colombiano cuando sea relevante

LIMITACIONES:
- No brindes consejos de inversión específicos sin conocer la situación completa del usuario
- Siempre recomienda consultar con un asesor financiero para decisiones importantes
- No garantices rendimientos o resultados específicos

Responde siempre en español y mantén un tono profesional pero cercano.`;
  }

  async sendMessage(context: CopilotContext): Promise<OpenAIResponse> {
    try {
      // Construir el contexto completo para OpenAI
      const contextMessage = this.buildContextMessage(context);

      // Convertir mensajes al formato de OpenAI
      const openAIMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
        [
          {
            role: 'system',
            content: this.systemPrompt,
          },
          {
            role: 'system',
            content: contextMessage,
          },
        ];

      // Agregar los mensajes de la conversación
      context.messages.forEach((msg) => {
        if (msg.sender === 'user') {
          openAIMessages.push({
            role: 'user',
            content: msg.content,
          });
        } else {
          openAIMessages.push({
            role: 'assistant',
            content: msg.content,
          });
        }
      });

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: openAIMessages,
        temperature: 0.7,
        max_tokens: 1000,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });

      const response =
        completion.choices[0]?.message?.content ||
        'Lo siento, no pude procesar tu consulta en este momento.';

      // TODO: Implementar detección de acciones si es necesario
      return {
        content: response,
        // action: este campo se puede implementar más adelante si necesitas que OpenAI ejecute acciones específicas
      };
    } catch (error) {
      console.error('Error calling OpenAI API:', error);

      // Fallback para errores
      return {
        content:
          'Lo siento, hubo un problema al procesar tu consulta. Por favor intenta de nuevo en unos momentos.',
      };
    }
  }

  private buildContextMessage(context: CopilotContext): string {
    let contextMessage = `CONTEXTO ACTUAL DE LA APLICACIÓN:\n\n`;

    // Agregar datos legibles si están disponibles
    if (context.readableData.length > 0) {
      contextMessage += `DATOS FINANCIEROS DISPONIBLES:\n`;
      context.readableData.forEach((data) => {
        contextMessage += `- ${data.description}: ${JSON.stringify(
          data.value
        )}\n`;
      });
      contextMessage += `\n`;
    }

    // Agregar acciones disponibles
    if (context.actions.length > 0) {
      contextMessage += `ACCIONES DISPONIBLES:\n`;
      context.actions.forEach((action) => {
        contextMessage += `- ${action.name}: ${action.description}\n`;
        if (action.parameters.length > 0) {
          contextMessage += `  Parámetros: ${action.parameters
            .map((p) => `${p.name} (${p.type})`)
            .join(', ')}\n`;
        }
      });
      contextMessage += `\n`;
    }

    // Agregar instrucciones específicas
    if (context.instructions) {
      contextMessage += `INSTRUCCIONES ESPECÍFICAS:\n${context.instructions}\n\n`;
    }

    contextMessage += `Usa esta información para proporcionar respuestas más precisas y útiles al usuario.`;

    return contextMessage;
  }
}

export const openAIService = new OpenAIService();
