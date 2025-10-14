import { Platform } from 'react-native';
import chatbotContext from '@/data/mock/chatbot-context.json';

// Solo importar OpenAI en plataformas nativas (no web)
let OpenAI: any = null;
let openai: any = null;

if (Platform.OS !== 'web') {
  OpenAI = require('openai').default;
  openai = new OpenAI({
    apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
  });
}

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
    // En web, usar respuestas mock
    if (Platform.OS === 'web' || !openai) {
      return this.getMockResponse(context);
    }

    try {
      // Construir el contexto completo para OpenAI
      const contextMessage = this.buildContextMessage(context);

      // Convertir mensajes al formato de OpenAI
      const openAIMessages: any[] = [
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

      return {
        content: response,
      };
    } catch (error) {
      console.error('Error calling OpenAI API:', error);

      return {
        content:
          'Lo siento, hubo un problema al procesar tu consulta. Por favor intenta de nuevo en unos momentos.',
      };
    }
  }

  private getMockResponse(context: CopilotContext): Promise<OpenAIResponse> {
    const lastMessage = context.messages[context.messages.length - 1]?.content?.toLowerCase() || '';

    let response = '';

    if (lastMessage.includes('patrimonio') || lastMessage.includes('dinero')) {
      response = `Basándome en tus datos financieros actuales:

Tu patrimonio neto total es de $${chatbotContext.patrimony.totals.totalNetWorth.toLocaleString('es-CL')} CLP.

Esto se compone de:
• Activos totales: $${chatbotContext.patrimony.totals.totalAssets.toLocaleString('es-CL')} CLP
• Pasivos totales: $${chatbotContext.patrimony.totals.totalLiabilities.toLocaleString('es-CL')} CLP

Tu mayor activo son las Inversiones Vector que representan una parte muy significativa de tu patrimonio.`;
    } else if (lastMessage.includes('ahorro') || lastMessage.includes('gasto')) {
      response = `Según tu análisis de gastos e ingresos:

Tu tasa de ahorro actual es del ${chatbotContext.monthlyTrends.incomeVsExpenses.savingsRate}%.

Esta es una excelente tasa de ahorro que te permite construir patrimonio de manera consistente. Te sugiero mantener este ritmo y considerar diversificar tus inversiones.`;
    } else {
      response = `Hola! Soy tu Copiloto financiero. Puedo ayudarte a analizar tu patrimonio, revisar tus gastos e ingresos, y darte consejos personalizados.

Tu patrimonio actual es de $${chatbotContext.patrimony.totals.totalNetWorth.toLocaleString('es-CL')} CLP.

¿En qué puedo ayudarte específicamente?`;
    }

    return Promise.resolve({
      content: response + '\n\n(Nota: Funcionalidad limitada en web. Para funciones completas usa la app móvil.)'
    });
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