# 🏦 Reglas de Cursor para Patrimore Financial App

## Filosofía de Desarrollo
- **Clean Code First**: Código legible, mantenible y testeable
- **Performance by Design**: Optimización desde el desarrollo, no como afterthought
- **Security by Default**: Implementación segura desde el primer día
- **User Experience**: Accesibilidad y usabilidad en cada componente
- **Developer Experience**: Herramientas y procesos que faciliten el desarrollo

## Tecnologías del Proyecto
- **React Native 0.79.5** con Expo SDK 53
- **TypeScript** con strict mode habilitado
- **Expo Router** para navegación
- **NativeWind** (Tailwind CSS para React Native)
- **Zustand** para manejo de estado global
- **React Hook Form** para formularios
- **Auth0** para autenticación
- **OpenAI** para funcionalidades de copilot
- **i18next** para internacionalización
- **D3** para gráficos y visualizaciones
- **AsyncStorage** para persistencia de datos
- **React Native Purchases** para monetización

## Estructura del Proyecto

### Organización por Features
```
app/ - Screens y layouts (Expo Router)
components/ - Componentes organizados por feature
  budget/ - Componentes relacionados al presupuesto
  copilot/ - Componentes del chat IA
  icons/ - Iconos personalizados
  investment/ - Componentes de inversión
  navigation/ - Componentes de navegación
  patrimony/ - Componentes de patrimonio
  planning/ - Componentes de planificación
  ui/ - Componentes UI reutilizables
hooks/ - Hooks personalizados organizados por feature
services/ - Servicios API organizados por feature
providers/ - Context providers
constants/ - Constantes organizadas por categoría
types/ - Definiciones de tipos
locales/ - Archivos de traducción
styles/ - Estilos específicos por feature
```

## Convenciones de Código

### Naming Conventions
- **Componentes React**: PascalCase (`Button`, `UserSelector`)
- **Hooks personalizados**: camelCase con prefijo "use" (`useAuthToken`, `useNetworthHistoric`)
- **Funciones y variables**: camelCase (`getToken`, `isLoading`)
- **Constantes**: SCREAMING_SNAKE_CASE (`BUDGET_CATEGORY_KEYS`, `COPILOT_SUGGESTION_KEYS`)
- **Tipos e interfaces**: PascalCase (`UseAuthTokenReturn`, `ButtonProps`)
- **Archivos**: kebab-case para screens, PascalCase para componentes

### TypeScript Best Practices
- **Siempre usa tipos explícitos** para props de componentes
- **Utiliza interfaces** para definir shapes complejos de objetos
- **Usa const assertions** para arrays y objetos inmutables (`as const`)
- **Define return types** explícitos para hooks personalizados
- **Evita `any`** - usa `unknown` o tipos específicos
- **Utiliza generics** cuando sea apropiado para reutilización

### Componentes React
- **Usa functional components** con hooks
- **Destructura props** en el parámetro de la función
- **Define props interface** antes del componente
- **Usa default values** en destructuring cuando sea apropiado
- **Exporta componentes** usando named exports
- **Implementa barrel exports** en index.ts para cada feature

### Hooks Personalizados
- **Siempre prefija con "use"**
- **Retorna objetos** con propiedades nombradas, no arrays
- **Define interface de retorno** explícita
- **Incluye loading states** cuando manejes async operations
- **Maneja errores** adecuadamente
- **Documenta el propósito** del hook con comentarios

### Estilos y UI
- **Usa NativeWind (Tailwind)** como sistema de estilos principal
- **Utiliza el sistema de colores** definido en tailwind.config.js:
  - `primary-*` para colores primarios (grises)
  - `secondary-*` para colores de acento (naranjas)
  - `success-*`, `error-*`, `navy-*` para estados
- **Usa el sistema de colores expuesto en tailwind.config.js y constants/Colors.ts (misma fuente).**
- **Combina className con style** solo cuando sea necesario
- **Usa la función `cn`** (tailwind-merge) para concatenar clases
- **Implementa variantes de componentes** usando objetos Record
- **Mantén consistencia** en spacing usando el sistema definido (1-10)

### Manejo de Estado
- **Usa Zustand** para estado global
- **Usa useState** para estado local de componentes
- **Usa React Hook Form** para manejo de formularios
- **Usa AsyncStorage** para persistencia simple
- **Evita prop drilling** - usa context/zustand cuando sea necesario

### API y Servicios
- **Organiza servicios** por feature en carpetas separadas
- **Usa async/await** en lugar de .then/.catch
- **Implementa error handling** adecuado
- **Usa tipos** para requests y responses de API
- **Centraliza configuración** de API en services/api.ts
- **Utiliza headers de auth** consistentemente

### Internacionalización
- **Usa i18next** para todas las strings visible al usuario
- **Define keys** descriptivas en archivos de traducción
- **Soporte para es.json y en.json**
- **Usa returnObjects: true** para arrays y objetos complejos
- **Implementa fallbacks** para keys faltantes

### Testing (cuando aplique)
- **Usa Jest** con @testing-library/react-native
- **Nombra tests** descriptivamente
- **Agrupa tests relacionados** con describe blocks
- **Mockea dependencies externas** como APIs
- **Testa comportamientos**, no implementación

## Patrones Específicos del Proyecto

### Auth0 Integration
- **Usa useAuth hook** del AuthProvider
- **Implementa token refresh** adecuadamente
- **Maneja estados de loading** durante auth flows
- **Guarda tokens** en AsyncStorage de forma segura

### OpenAI Copilot
- **Mantén contexto del chat** en el provider
- **Implementa streaming responses** cuando sea posible
- **Maneja rate limiting** y errores de API
- **Usa tipos específicos** para mensajes y sugerencias

### Expo Router Navigation
- **Usa typed routes** (experiments.typedRoutes: true)
- **Implementa layouts** apropiados para cada feature
- **Usa push/replace** apropiadamente
- **Maneja back navigation** consistentemente

### Gráficos con D3
- **Usa hooks personalizados** para lógica de charts
- **Separa lógica de presentación** de cálculos
- **Implementa responsive design** para diferentes tamaños
- **Usa tipos** para data structures de gráficos

### Performance
- **Usa React.memo** para componentes que re-renderizan frecuentemente
- **Implementa lazy loading** para screens pesadas
- **Optimiza images** usando expo-image cuando sea apropiado
- **Evita cálculos pesados** en render - usa useMemo/useCallback

## Estructura de Archivos

### Componentes
```typescript
// components/ui/Button.tsx
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { cn } from '@/lib/utils';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
}

export function Button({ title, onPress, variant = 'primary', disabled = false }: ButtonProps) {
  // implementación
}
```

### Hooks
```typescript
// hooks/common/useAuthToken.ts
import { useState, useEffect } from 'react';

export interface UseAuthTokenReturn {
  token: string | null;
  isLoading: boolean;
  getToken: () => Promise<string | null>;
}

export const useAuthToken = (): UseAuthTokenReturn => {
  // implementación
};
```

### Servicios
```typescript
// services/user/userService.ts
interface UserData {
  id: string;
  email: string;
}

export const getUserData = async (token: string): Promise<UserData> => {
  // implementación
};
```

### Constantes
```typescript
// constants/AppConstants.ts
export const BUDGET_CATEGORIES = [
  { key: 'housing', color: '#8e24aa' },
  { key: 'transport', color: '#3b82f6' }
] as const;

export type BudgetCategoryKey = typeof BUDGET_CATEGORIES[number]['key'];
```

## Comandos y Scripts Disponibles
- `npm run dev` - Inicia el desarrollo con Expo
- `npm run lint` - Ejecuta el linter de Expo
- `npm run dev:css` - Watch mode para Tailwind CSS
- `npm run test` - Ejecuta tests con Jest
- `npm run android` - Ejecuta en Android
- `npm run ios` - Ejecuta en iOS

## Reglas Específicas para Cursor

1. **Siempre verifica** que los imports usen los path aliases (@/*)
2. **Mantén consistencia** con los patrones existentes del proyecto
3. **Usa el sistema de colores** definido en tailwind.config.js
4. **Implementa barrel exports** para nuevos features
5. **Sigue la estructura de carpetas** establecida
6. **Usa TypeScript strict mode** - nunca desactives type checking
7. **Implementa error handling** apropiado en todas las funciones async
8. **Usa i18next** para cualquier string visible al usuario
9. **Testea nuevos componentes** cuando sea relevante
10. **Documenta funciones complejas** con comentarios JSDoc

## Librerías y Dependencias Importantes
- `@react-native-async-storage/async-storage` - Para persistencia
- `react-native-auth0` - Para autenticación
- `openai` - Para funcionalidades IA
- `i18next` y `react-i18next` - Para traduciones
- `react-hook-form` - Para formularios
- `zustand` - Para estado global
- `d3` y `react-native-svg` - Para gráficos
- `nativewind` - Para estilos
- `expo-router` - Para navegación
- `lucide-react-native` - Para iconos
- `tailwind-merge` - Para concatenar clases CSS

## 🧹 Code Quality & Linting

### ESLint & Prettier Configuration
- **Usa Expo's ESLint config** como base (`expo lint`)
- **Configura Prettier** para formateo consistente
- **Implementa pre-commit hooks** con lint-staged
- **Usa absolute imports** siempre (@/*)
- **Ordena imports** según convención:
  1. React/React Native
  2. Third-party libraries
  3. Internal imports (@/*)
  4. Relative imports (../, ./)

### Reglas de Código Limpio
```typescript
// ❌ MAL - Componente muy largo y con responsabilidades mixtas
export function UserDashboard({ userId }: { userId: string }) {
  // 200+ líneas de código...
}

// ✅ BIEN - Separado en componentes especializados
export function UserDashboard({ userId }: UserDashboardProps) {
  return (
    <Container>
      <UserHeader userId={userId} />
      <UserStats userId={userId} />
      <UserActions userId={userId} />
    </Container>
  );
}
```

- **Single Responsibility**: Un componente, una responsabilidad
- **Máximo 150 líneas** por componente (ideal: 50-100)
- **Máximo 5 parámetros** por función
- **Early returns** para reducir nesting

## 🔐 Security Best Practices

### Manejo Seguro de Datos
- **NUNCA hardcodees secrets** en el código
- **Usa Expo SecureStore** para datos sensibles (no AsyncStorage)
- **Sanitiza inputs** de usuario siempre
- **Valida datos** en cliente Y servidor
- **Implementa timeouts** en requests de API (10-30s)

### Variables de Entorno
```typescript
// config/env.ts
interface EnvConfig {
  AUTH0_DOMAIN: string;
  OPENAI_API_KEY: string;
  API_BASE_URL: string;
}

export const ENV: EnvConfig = {
  AUTH0_DOMAIN: process.env.EXPO_PUBLIC_AUTH0_DOMAIN!,
  OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY!,
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL!,
};

// Valida que todas las env vars existan
Object.entries(ENV).forEach(([key, value]) => {
  if (!value) throw new Error(`Missing environment variable: ${key}`);
});
```

## ♿ Accessibility (A11y)

### Implementación Obligatoria
- **Usa `accessibilityLabel`** en todos los TouchableOpacity
- **Usa `accessibilityHint`** para explicar acciones
- **Usa `accessibilityRole`** apropiado (button, text, image, etc.)
- **Implementa `accessibilityState`** para estados dinámicos
- **Contraste mínimo** 4.5:1 para texto normal, 3:1 para texto grande

```typescript
// ✅ BIEN - Componente accesible
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel="Agregar al presupuesto"
  accessibilityHint="Agrega este gasto a tu presupuesto mensual"
  accessibilityState={{ disabled: isLoading }}
>
  <Text>Agregar</Text>
</TouchableOpacity>
```

## 🚨 Error Handling & Monitoring

### Error Boundaries
```typescript
// components/common/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<any> },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring service
    console.error('Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ? <this.props.fallback /> : <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### Async Error Handling
```typescript
// ✅ BIEN - Manejo completo de errores
export const useUserData = () => {
  const [data, setData] = useState<UserData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userData = await userService.getUserData();
      setData(userData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, error, isLoading, refetch: fetchUserData };
};
```

## ⚡ Performance Optimizations Avanzadas

### Lazy Loading & Code Splitting
```typescript
// ✅ BIEN - Lazy loading de screens
const InvestmentScreen = lazy(() => import('@/app/(tabs)/investment/index'));
const BudgetScreen = lazy(() => import('@/app/(tabs)/budget/index'));

// Para componentes pesados
const HeavyChart = lazy(() => import('@/components/charts/HeavyChart'));
```

### Memory Leak Prevention
```typescript
// ✅ BIEN - Cleanup en useEffect
useEffect(() => {
  const subscription = someService.subscribe(callback);
  const timeout = setTimeout(() => {}, 1000);

  return () => {
    subscription.unsubscribe(); // Cleanup subscriptions
    clearTimeout(timeout); // Cleanup timers
  };
}, []);

// Para listeners
useEffect(() => {
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    // handle state change
  };

  const subscription = AppState.addEventListener('change', handleAppStateChange);
  return () => subscription?.remove(); // Cleanup listener
}, []);
```

### Image Optimization
```typescript
// ✅ BIEN - Usa expo-image para mejor performance
import { Image } from 'expo-image';

<Image
  source={{ uri: imageUrl }}
  style={{ width: 100, height: 100 }}
  contentFit="cover"
  cachePolicy="memory-disk" // Cache agresivo
  placeholder={{ blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj' }} // Placeholder mientras carga
/>
```

## 🎨 Design System & Component Composition

### Compound Components Pattern
```typescript
// ✅ BIEN - Patrón de composición
export const Card = ({ children, className, ...props }: CardProps) => (
  <View className={cn('bg-white rounded-lg shadow-md', className)} {...props}>
    {children}
  </View>
);

Card.Header = ({ children, className }: CardHeaderProps) => (
  <View className={cn('p-4 border-b border-gray-200', className)}>
    {children}
  </View>
);

Card.Body = ({ children, className }: CardBodyProps) => (
  <View className={cn('p-4', className)}>{children}</View>
);

// Uso:
<Card>
  <Card.Header>
    <Text>Título</Text>
  </Card.Header>
  <Card.Body>
    <Text>Contenido</Text>
  </Card.Body>
</Card>
```

### Design Tokens Consistency
```typescript
// constants/DesignTokens.ts
export const DESIGN_TOKENS = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  },
} as const;
```

## 🔄 State Management Patterns Avanzados

### Zustand Best Practices
```typescript
// ✅ BIEN - Store con middlewares y tipos
interface AppState {
  user: User | null;
  preferences: UserPreferences;
  // actions
  setUser: (user: User | null) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        preferences: DEFAULT_PREFERENCES,
        
        setUser: (user) => set({ user }, false, 'setUser'),
        updatePreferences: (prefs) => 
          set(
            (state) => ({ preferences: { ...state.preferences, ...prefs } }),
            false,
            'updatePreferences'
          ),
        reset: () => set({ user: null, preferences: DEFAULT_PREFERENCES }, false, 'reset'),
      }),
      {
        name: 'app-storage',
        partialize: (state) => ({ user: state.user, preferences: state.preferences }),
      }
    )
  )
);

// Selectors optimizados
export const useUser = () => useAppStore((state) => state.user);
export const usePreferences = () => useAppStore((state) => state.preferences);
```

### Form Validation Patterns
```typescript
// ✅ BIEN - Validación reutilizable
import { z } from 'zod';

export const UserProfileSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  age: z.number().min(18, 'Debe ser mayor de edad').max(120, 'Edad inválida'),
});

export type UserProfileFormData = z.infer<typeof UserProfileSchema>;

// En el componente
const {
  control,
  handleSubmit,
  formState: { errors, isValid, isSubmitting },
} = useForm<UserProfileFormData>({
  resolver: zodResolver(UserProfileSchema),
  mode: 'onChange', // Validación en tiempo real
});
```

## 🚀 Git Workflow & Development

### Commit Convention
```bash
# Formato: tipo(scope): descripción
feat(auth): add biometric authentication
fix(budget): resolve category calculation bug
perf(charts): optimize D3 rendering performance
docs(readme): update installation instructions
test(hooks): add useAuthToken test coverage
```

### Branch Strategy
- `main` - Código en producción
- `develop` - Integración de features
- `feature/AUTH-123-biometric-login` - Nuevas características
- `hotfix/URGENT-login-crash` - Fixes urgentes
- `release/v1.2.0` - Preparación de releases

## 📱 Platform-Specific Guidelines

### iOS/Android Differences
```typescript
// ✅ BIEN - Detección de plataforma
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 44 : 24, // Status bar height
    shadowColor: Platform.OS === 'ios' ? '#000' : undefined,
    elevation: Platform.OS === 'android' ? 8 : undefined,
  },
});

// Para código específico de plataforma
const PlatformButton = Platform.select({
  ios: () => require('./ButtonIOS').default,
  android: () => require('./ButtonAndroid').default,
})();
```

## 🎭 Animation & Interaction Guidelines

### Reanimated Best Practices
```typescript
// ✅ BIEN - Animaciones performantes
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  runOnJS 
} from 'react-native-reanimated';

export const AnimatedButton = ({ onPress, children }: Props) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, undefined, (finished) => {
      if (finished) {
        runOnJS(onPress)();
      }
    });
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut}>
        {children}
      </TouchableWithoutFeedback>
    </Animated.View>
  );
};
```

## 📊 Monitoring & Analytics

### Performance Monitoring
```typescript
// utils/performance.ts
export const measurePerformance = (name: string) => {
  const start = performance.now();
  
  return {
    end: () => {
      const duration = performance.now() - start;
      console.log(`⚡ ${name}: ${duration.toFixed(2)}ms`);
      // Send to analytics service
    }
  };
};

// Uso en componentes pesados
const MyComponent = () => {
  useEffect(() => {
    const perf = measurePerformance('MyComponent render');
    return perf.end;
  }, []);
};
```

## ❌ Antipatrones - QUÉ NO HACER

### ❌ Estado en render
```typescript
// ❌ MAL
const MyComponent = () => {
  const [data] = useState(expensiveCalculation()); // Se ejecuta en cada render!
  
  // ✅ BIEN
  const [data] = useState(() => expensiveCalculation()); // Solo una vez
};
```

### ❌ Mutación directa de props/state
```typescript
// ❌ MAL
const updateUser = (user: User) => {
  user.name = 'New name'; // Mutación directa!
  setUser(user);
};

// ✅ BIEN
const updateUser = (user: User) => {
  setUser({ ...user, name: 'New name' });
};
```

### ❌ useEffect sin dependencias
```typescript
// ❌ MAL
useEffect(() => {
  fetchData(); // Se ejecutará en cada render
});

// ✅ BIEN
useEffect(() => {
  fetchData();
}, []); // Solo al montar

// ✅ MEJOR
const { data, loading, error } = useSWR('/api/data', fetchData);
```

---

## 🎯 Checklist de Calidad

Antes de hacer commit, verifica:

- [ ] ✅ **TypeScript**: Sin errores de tipos
- [ ] 🧹 **Linter**: Sin warnings de ESLint
- [ ] 🎨 **Formato**: Código formateado con Prettier  
- [ ] ♿ **A11y**: Labels y hints implementados
- [ ] 🔐 **Security**: No secrets hardcodeados
- [ ] ⚡ **Performance**: useCallback/useMemo donde corresponde
- [ ] 🧪 **Tests**: Cobertura en funciones críticas
- [ ] 🌍 **i18n**: Strings externalizadas
- [ ] 📝 **Docs**: Funciones complejas documentadas
- [ ] 🏗️ **Architecture**: Single Responsibility respetado

**Recuerda**: El código se lee más veces de las que se escribe. Prioriza la claridad sobre la brevedad.
