
export const IMAGES = {
  ADVISOR: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
  EXPERT_1: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  EXPERT_2: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  EXPERT_3: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
} as const;

export const LABELS = {
  TABS: {
    PATRIMONY: 'Patrimonio',
    BUDGET: 'Presupuestos',
    PLANNING: 'Planificación',
    INVESTMENT: 'Inversión',
  },
  PLANNING: {
    TITLE: 'Planificación Financiera',
    SUBTITLE: 'Tu camino hacia el éxito financiero',
    ADVISOR_NAME: 'Fernando Slebe',
    ADVISOR_TITLE: 'Asesor de Inversiones Certificado',
    ADVISOR_EXPERIENCE: '+10 años de experiencia',
    ADVISOR_BIO: 'Fernando Slebe es un Asesor de Inversiones acreditado especializado en planificación financiera integral y estrategias de inversión a largo plazo.',
    NEXT_MEETING: 'Próxima reunión',
    NO_MEETING: 'Ninguna programada',
    INBOX: 'Bandeja de entrada',
    NO_MESSAGES: 'No hay mensajes nuevos',
    SCHEDULE: 'Programar',
    CHAT: 'Chat',
  },
  PATRIMONY: {
    TITLE: 'Patrimonio',
    NET_WORTH: 'Patrimonio Neto',
    SEARCH_PLACEHOLDER: 'Buscar activo o pasivo',
    ASSETS: 'Activos',
    LIABILITIES: 'Pasivos',
    TOTAL_IN: 'Total en',
    TOTAL_ASSETS: 'Total en activos',
    TOTAL_LIABILITIES: 'Total en pasivos',
    LAST_MONTH_COMPARISON: 'vs último mes',
  },
  BUDGET: {
    TITLE: 'Presupuestos',
    INCOME: 'Ingresos',
    EXPENSES: 'Gastos',
    TOTAL_INCOME: 'Total en ingresos',
    TOTAL_EXPENSES: 'Total en gastos',
    SEARCH_INCOME_PLACEHOLDER: 'Buscar en ingresos',
    SEARCH_EXPENSES_PLACEHOLDER: 'Buscar en gastos',
    REMAINING: 'restante de',
    NO_DATA: 'Sin datos para este mes',
  },
  INVESTMENT: {
    TITLE: 'Inversiones',
    PORTFOLIO: 'Portfolio',
    PATRIMONY_LABEL: 'Tu patrimonio',
    INVEST: 'Invertir',
    CREATE: 'Crear',
    BEGIN: 'Comenzar',
    CONTINUE_WITHOUT_ACCOUNT: 'Continuar sin cuenta',
    GROW_PATRIMONY: 'Un solo lugar para hacer crecer tu patrimonio.',
    PERSONALIZED_OPTIONS: 'Opciones de ahorro e inversión personalizadas, para todo tipo de inversionista.',
  },
  BENEFITS: {
    TITLE: '¿Por qué elegir nuestro asesoramiento?',
    AVAILABILITY: 'Disponibilidad 24/7',
    AVAILABILITY_DESC: 'Chat y consultas cuando lo necesites',
    CERTIFICATION: 'Certificación Garantizada',
    CERTIFICATION_DESC: 'Todos nuestros asesores están certificados',
    PERSONALIZED: 'Planes Personalizados',
    PERSONALIZED_DESC: 'Estrategias adaptadas a tus objetivos',
  },
  COMMON: {
    CONTINUE: 'Continuar',
    CANCEL: 'Cancelar',
    SAVE: 'Guardar',
    DELETE: 'Eliminar',
    EDIT: 'Editar',
    VIEW_ALL: 'Ver todo',
    LOAD_MORE: 'Cargar más',
    SEARCH: 'Buscar',
    FILTER: 'Filtrar',
  }
} as const;

export const FOR_YOU_CARDS = [
  {
    id: '1',
    category: 'Gastos',
    iconColor: '#06b6d4',
    bgColor: '#e0f2fe',
    title: '$89,500/mes',
    description: 'gastado en servicios básicos, encuentra formas de ahorrar ahora',
  },
  {
    id: '2',
    category: 'Análisis de gastos',
    iconColor: '#f59e0b',
    bgColor: '#fef3c7',
    title: '$1.250.000 típicamente',
    description: 'profundiza en tus gastos de los últimos seis meses',
  },
  {
    id: '3',
    category: 'Ahorro',
    iconColor: '#10b981',
    bgColor: '#d1fae5',
    title: 'Meta mensual',
    description: 'establece metas de ahorro y alcanza tus objetivos financieros',
  },
] as const;

export const APP_CONFIG = {
  CURRENCY: 'CLP',
  LOCALE: 'es-CL',
  DEFAULT_TIME_RANGE: '6 Meses',
  LOAD_MORE_STEP: 10,
  INITIAL_ITEMS_COUNT: 5,
} as const;

export const TIME_RANGES = {
  MAPPING: {
    '1 Mes': '1m',
    '6 Meses': '6m', 
    '1 Año': '1y',
    Todo: 'all',
  },
  LABELS: ['1 Mes', '6 Meses', '1 Año', 'Todo'],
} as const;

export const BUDGET_CATEGORIES = [
  { 
    label: 'Vivienda', 
    color: '#8e24aa',
    description: 'Arriendo, hipoteca, servicios básicos del hogar'
  },
  { 
    label: 'Transporte', 
    color: '#3b82f6',
    description: 'Combustible, transporte público, mantenimiento vehículo'
  },
  { 
    label: 'Ocio', 
    color: '#ec4899',
    description: 'Entretenimiento, restaurantes, compras recreativas'
  },
  { 
    label: 'Salud', 
    color: '#06b6d4',
    description: 'Seguro médico, medicamentos, consultas médicas'
  },
  { 
    label: 'Servicios', 
    color: '#10b981',
    description: 'Internet, teléfono, streaming, servicios financieros'
  },
] as const;

export const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
] as const;

export const PLANNING_REPORTS = [
  {
    id: '1',
    title: 'Reporte Financiero',
    description: 'Análisis completo de tu situación financiera',
    fileType: 'PDF',
    size: '2.1 MB',
    contentPoints: ['Balance patrimonial', 'Flujo de caja mensual', 'Recomendaciones personalizadas'],
    bulletColor: '#8b5cf6'
  },
  {
    id: '2',
    title: 'Inversión',
    description: 'Estado y rendimiento de tus inversiones',
    fileType: 'PDF',
    size: '1.9 MB',
    contentPoints: ['Análisis de performance', 'Distribución de activos', 'Comparación con benchmarks'],
    bulletColor: '#06b6d4'
  },
  {
    id: '3',
    title: 'Estado Fondos Mutuos',
    description: 'Performance detallada de fondos mutuos',
    fileType: 'PDF',
    size: '2.7 MB',
    contentPoints: ['Evolución mensual', 'Composición de cartera', 'Ranking de rentabilidad'],
    bulletColor: '#10b981'
  }
] as const;

export const USER_LABELS = {
  MY_LABEL: 'GD',
  PARTNER_LABEL: 'J',
  VIEW_OPTIONS: ['mine', 'partner', 'both'] as const,
} as const;

export const PATRIMONY_DATA = {
  MY_ASSETS: [
    { id: '1', name: 'Cuenta Corriente', type: 'Banco de Chile', value: 7204483, change: 2.8, color: '#4285F4' },
    { id: '2', name: 'Cuenta de Ahorro', type: 'Banco de Chile', value: 5382610, change: 1.4, color: '#EA4335' },
    { id: '3', name: 'Inversión', type: 'Fondo Mutuo Santander', value: 892147, change: -0.5, color: '#FBBC05' },
    { id: '4', name: 'Inversión', type: 'Inversiones Vector', value: 280000000, change: 3.2, color: '#6366F1' },
  ],
  PARTNER_ASSETS: [
    { id: '5', name: 'Cuenta Corriente', type: 'Banco Falabella', value: 280000, change: 3.2, color: '#6366F1' },
    { id: '6', name: 'Cuenta de Ahorro', type: 'Banco Itaú', value: 150000, change: 0.8, color: '#10B981' },
    { id: '7', name: 'Inversión', type: 'Inversión Nevasa', value: 500000, change: 1.2, color: '#F59E0B' },
  ],
  MY_LIABILITIES: [
    { id: '8', name: 'Crédito Hipotecario', type: 'Banco Santander', value: 85000000, change: -2.5, color: '#DC2626' },
    { id: '9', name: 'Tarjeta de Crédito', type: 'Banco de Chile', value: 1250000, change: 15.2, color: '#7C2D12' },
    { id: '10', name: 'Crédito Vehicular', type: 'Forus', value: 12500000, change: -5.8, color: '#B91C1C' },
  ],
  PARTNER_LIABILITIES: [
    { id: '11', name: 'Crédito Educativo', type: 'Banco Scotiabank', value: 8500000, change: -3.2, color: '#991B1B' },
    { id: '12', name: 'Tarjeta de Crédito', type: 'Banco de Chile', value: 890000, change: 8.4, color: '#7F1D1D' },
    { id: '13', name: 'Línea de Crédito', type: 'Banco de Chile', value: 2500000, change: 0.0, color: '#6B1D1D' },
  ],
} as const;

export const TAB_CONFIG = {
  PATRIMONY: [
    { key: 'assets', label: 'Activos' },
    { key: 'liabilities', label: 'Pasivos' }
  ],
  BUDGET: [
    { key: 'income', label: 'Ingresos' },
    { key: 'expenses', label: 'Gastos' }
  ]
} as const;
