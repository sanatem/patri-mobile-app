import OpenAI from 'openai';
import chatbotContext from '@/assets/data/chatbot-context.json';

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

FORMATO DE RESPUESTA OBLIGATORIO:
- NUNCA uses asteriscos (*), guiones (-), numerales (#), ni corchetes []
- NUNCA escribas **texto en negrita** o *texto en cursiva*
- NUNCA uses ## títulos o ### subtítulos
- Para listas usa solo números: 1. 2. 3. o viñetas simples: •
- Para destacar usa MAYÚSCULAS o repite palabras importantes
- Usa solo texto plano con saltos de línea
- Máximo 3-4 líneas por párrafo

EJEMPLO CORRECTO:
Aquí tienes tu resumen de inversiones:

1. Inversión en Fondo Mutuo Santander
   Valor: $892,147 CLP
   Cambio: -0.5%

2. Inversión en Inversiones Vector  
   Valor: $280,000,000 CLP
   Cambio: +3.2%

Tu MAYOR inversión es Inversiones Vector que representa una parte muy significativa de tu patrimonio.

CONTEXTO FINANCIERO DEL USUARIO:
${JSON.stringify(chatbotContext, null, 2)}

INFORMACIÓN IMPORTANTE:
- El usuario principal se identifica como "${
      chatbotContext.userProfile.initials
    }" y tiene un partner "${chatbotContext.userProfile.partner.initials}"
- Patrimonio neto total: $${chatbotContext.patrimony.totals.totalNetWorth.toLocaleString(
      'es-CL'
    )} CLP
- Activos totales: $${chatbotContext.patrimony.totals.totalAssets.toLocaleString(
      'es-CL'
    )} CLP
- Pasivos totales: $${chatbotContext.patrimony.totals.totalLiabilities.toLocaleString(
      'es-CL'
    )} CLP
- Mayor activo: ${chatbotContext.insights[0]}
- Mayor pasivo: ${chatbotContext.insights[1]}
- Tasa de ahorro: ${chatbotContext.monthlyTrends.incomeVsExpenses.savingsRate}%

LIMITACIONES:
- No brindes consejos de inversión específicos sin conocer la situación completa del usuario
- Siempre recomienda consultar con un asesor financiero para decisiones importantes
- No garantices rendimientos o resultados específicos

RECUERDA: Responde SIEMPRE en texto plano sin ningún formato especial. Usa toda esta información para dar respuestas personalizadas y relevantes en español con tono profesional pero cercano.`;
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
