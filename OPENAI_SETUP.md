# Configuración de OpenAI para el Copilot

## Configuración Requerida

Para que el copilot funcione con OpenAI, necesitas configurar tu API key:

### 1. Obtener API Key de OpenAI

1. Ve a [OpenAI Platform](https://platform.openai.com/api-keys)
2. Crea una cuenta o inicia sesión
3. Genera una nueva API key
4. Copia la API key

### 2. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

```
EXPO_PUBLIC_OPENAI_API_KEY=tu_api_key_de_openai_aqui
```

**IMPORTANTE:**

- Reemplaza `tu_api_key_de_openai_aqui` con tu API key real
- Nunca subas este archivo a control de versiones
- El archivo `.env.local` ya está incluido en `.gitignore`

### 3. Modelo Utilizado

El copilot está configurado para usar el modelo `gpt-4o-mini` que es:

- Rápido y eficiente
- Económico
- Ideal para conversaciones de asistencia financiera

### 4. Configuración de Seguridad

**Nota de Producción:** La configuración actual usa `dangerouslyAllowBrowser: true` para permitir llamadas directas desde el cliente. En producción, deberías:

1. Crear un endpoint en tu backend
2. Hacer las llamadas a OpenAI desde el servidor
3. Enviar solo las respuestas al cliente

### 5. Uso del Sistema

Una vez configurado, el copilot:

- Utilizará OpenAI para respuestas inteligentes
- Mantendrá el contexto de la conversación
- Incluirá datos financieros disponibles en el contexto
- Proporcionará consejos personalizados basados en los datos del usuario

### 6. Personalización

Puedes personalizar el comportamiento del copilot modificando:

- `systemPrompt` en `services/openai.ts`
- `instructions` en el `CopilotProvider`
- Parámetros del modelo (temperatura, max_tokens, etc.)

## Solución de Problemas

### Error: "Invalid API Key"

- Verifica que la API key esté correctamente configurada
- Asegúrate de que la API key tenga créditos disponibles

### Error: "Network Error"

- Verifica tu conexión a internet
- Comprueba que el modelo `gpt-4o-mini` esté disponible en tu región

### El copilot no responde

- Revisa la consola para errores
- Verifica que la variable de entorno esté configurada correctamente
- Asegúrate de haber reiniciado la aplicación después de configurar las variables de entorno
