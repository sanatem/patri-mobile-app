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
    description: 'Gastado en servicios básicos, encuentra formas de ahorrar ahora',
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

export const INVESTMENT_SURVEY_QUESTIONS = [
  {
    text: '¿Cuál es el principal objetivo de tu inversión?',
    options: [
      'Ahorrar para la educación de mis hijos',
      'Asegurar mi jubilación',
      'Incrementar mi patrimonio',
      'Planificar un viaje'
    ]
  },
  {
    text: '¿Cuál de estas alternativas representa mejor tu horizonte de inversión?',
    options: [
      'Podría necesitar el dinero en cualquier momento',
      'Necesitaré parte del dinero este año',
      'Quizás haga retiros esporádicos, pero la mayor parte de la inversión será a largo plazo',
      'No usaré este dinero en los próximos 3 años'
    ]
  },
  {
    text: '¿Qué grado de conocimiento financiero posees?',
    options: [
      'Nulo',
      'Entiendo la diferencia entre acciones y renta fija',
      'Conozco distintas opciones de inversión y sus niveles de riesgo',
      'Tengo un amplio conocimiento sobre productos y estrategias de inversión'
    ]
  },
  {
    text: '¿En qué productos has invertido anteriormente?',
    options: [
      'Cuenta de ahorro, depósitos a plazo y/o instrumentos de renta fija',
      'Fondos mutuos',
      'Acciones',
      'Productos Derivados'
    ]
  },
  {
    text: '¿Con cuál de las siguientes afirmaciones te identificas mejor?',
    options: [
      'Lo más importante es que mi inversión crezca de manera estable, no acepto fluctuaciones negativas del mercado',
      'Acepto oscilaciones negativas en el valor de mi patrimonio durante períodos de tiempo inferiores a un año',
      'Me importa la rentabilidad a mediano y largo plazo, sin sufrir fluctuaciones negativas importantes en el valor de mi patrimonio',
      'Puedo asumir fluctuaciones de mercado importantes en mis inversiones a cambio de mayores rentabilidades en el largo plazo'
    ]
  },
  {
    text: 'Si tienes una inversión con una rentabilidad del 30% y tiene una baja de 20% obteniendo un 10% a favor, ¿qué harías?',
    options: [
      'Me cambiaría a instrumentos sin riesgo',
      'Transferiría parte de los fondos a inversiones de menor riesgo',
      'Me preocuparía, pero no tomaría ninguna acción',
      'Invertiría más si hay fundamentos para ello'
    ]
  },
  {
    text: '¿Cuál es tu nivel de renta líquida mensual considerando todas tus fuentes de ingresos?',
    options: [
      'Menos de 1 millón de pesos',
      'Entre 1 y 3 millones de pesos',
      'Entre 3 y 5 millones de pesos',
      'Más de 5 millones de pesos'
    ]
  },
  {
    text: '¿Cuánto de tus ahorros estás dispuesto a invertir?',
    options: [
      'Menos del 30%',
      'Entre el 30% y el 60%',
      'Más del 60%'
    ]
  },
  {
    text: '¿Qué relación tiene tu profesión respecto a temas financieros?',
    options: [
      'Está muy relacionada',
      'Tiene cierta relación',
      'Tiene poca relación',
      'No tiene relación'
    ]
  },
  {
    text: '¿Cuál es el valor aproximado de su patrimonio disponible para inversión?',
    options: [
      'Más de $200 millones',
      'Entre $50 y $200 millones',
      'Menos de $50 millones'
    ]
  }
] as const;

export const REGIONS_AND_COMMUNES = {
  "Región Metropolitana": ["Santiago", "Puente Alto", "Maipú", "La Florida", "Las Condes"],
  "Valparaíso": ["Valparaíso", "Viña del Mar", "Quilpué", "Villa Alemana", "San Antonio"],
  "Biobío": ["Concepción", "Talcahuano", "Los Ángeles", "Coronel", "San Pedro de la Paz"],
  "Araucanía": ["Temuco", "Padre Las Casas", "Villarrica", "Angol", "Pucón"],
  "Los Lagos": ["Puerto Montt", "Osorno", "Castro", "Ancud", "Puerto Varas"],
  "Antofagasta": ["Antofagasta", "Calama", "Mejillones", "Tocopilla"],
} as const;

export const PERSONAL_INFORMATION_QUESTIONS = [
  {
    id: 'gender',
    type: 'choice',
    text: '¿Cómo nos dirigimos a ti?',
    options: [
      { label: 'En femenino', value: 'femenino' },
      { label: 'En masculino', value: 'masculino' }
    ]
  },
  {
    id: 'nationality',
    type: 'choice',
    text: '¿Tu nacionalidad es chilena?',
    options: [
      { label: 'Sí', value: 'si' },
      { label: 'No', value: 'no' }
    ]
  },
  {
    id: 'us_person',
    type: 'choice',
    text: '¿Eres US Person?',
    options: [
      { label: 'Sí', value: 'si' },
      { label: 'No', value: 'no' }
    ]
  },
  {
    id: 'foreign_tax',
    type: 'choice',
    text: '¿Tienes residencia tributaria en otro país?',
    options: [
      { label: 'Sí', value: 'si' },
      { label: 'No', value: 'no' }
    ]
  },
  {
    id: 'pep',
    type: 'choice',
    text: '¿Eres una persona expuesta políticamente (PEP)?',
    options: [
      { label: 'Sí', value: 'si' },
      { label: 'No', value: 'no' }
    ]
  },
  {
    id: 'address',
    type: 'form',
    text: '¿Cuál es tu dirección?',
    fields: [
      { name: 'address', type: 'text', placeholder: 'Dirección' },
      { name: 'region', type: 'select', placeholder: 'Selecciona una región', options: Object.keys(REGIONS_AND_COMMUNES) },
      { name: 'commune', type: 'select', placeholder: 'Selecciona una comuna', dependsOn: 'region' }
    ]
  },
  {
    id: 'phone',
    type: 'input',
    text: '¿Cuál es tu número de teléfono?',
    subtitle: 'Lo pedimos por razones regulatorias',
    placeholder: '9 1234 5678',
    inputType: 'phone-pad',
    validation: (value: string) => value.length >= 9
  },
  {
    id: 'income_source',
    type: 'choice',
    text: '¿De dónde proviene el dinero que quieres invertir?',
    options: [
      { label: 'Sueldo/Honorarios', value: 'sueldo' },
      { label: 'Inversiones', value: 'inversiones' },
      { label: 'Ingresos de negocio', value: 'negocio' },
      { label: 'Bienes raíces', value: 'bienes_raices' },
      { label: 'Herencia', value: 'herencia' },
      { label: 'Ahorros', value: 'ahorros' }
    ]
  },
  {
    id: 'occupation',
    type: 'form',
    text: '¿A qué te dedicas?',
    fields: [
      { name: 'employment', type: 'text', placeholder: 'Situación laboral' },
      { name: 'occupation', type: 'text', placeholder: 'Ocupación o profesión' }
    ]
  },
  {
    id: 'monthly_income',
    type: 'choice',
    text: '¿Cuál es tu ingreso mensual?',
    subtitle: 'Una estimación está bien',
    options: [
      { label: 'Menos de $500.000', value: 'menos_500' },
      { label: 'Entre $500.000 y $1.000.000', value: '500_1000' },
      { label: 'Entre $1.000.000 y $2.000.000', value: '1000_2000' },
      { label: 'Más de $2.000.000', value: 'mas_2000' }
    ]
  }
] as const;

export const INVESTMENT_GOALS = [
  { 
    label: 'Reserva', 
    value: 'Reserva', 
    icon: '🏦',
    description: 'Fondo de reserva para emergencias'
  },
  { 
    label: 'Casa', 
    value: 'Casa', 
    icon: '🏠',
    description: 'Ahorro para comprar casa'
  },
  { 
    label: 'Mejorar mi jubilación', 
    value: 'Mejorar mi jubilación', 
    icon: '💰',
    description: 'Plan de jubilación con APV-B'
  },
] as const;

export const INVESTMENT_PORTFOLIO_DATA = [
  {
    id: 'reserva',
    title: 'Reserva',
    subtitle: '',
    amount: '$0',
    icon: 'PiggyBank',
    category: 'investment',
    hasDetails: false
  },
  {
    id: 'emergencias',
    title: 'Emergencias',
    subtitle: 'Corto plazo',
    amount: '$59.809',
    icon: 'LineChart',
    category: 'investment',
    hasDetails: true
  },
  {
    id: 'casa',
    title: 'Casa',
    subtitle: 'Largo plazo',
    amount: '$0',
    icon: 'Home',
    category: 'investment',
    hasDetails: false
  },
  {
    id: 'jubilacion',
    title: 'Mejorar mi jubilación',
    subtitle: 'Jubilación con APV-B',
    amount: '$0',
    icon: 'ShieldCheck',
    category: 'investment',
    hasDetails: false
  },
] as const;

export const INVESTMENT_ACTIONS_DATA = [
  {
    id: 'dolares',
    title: 'Dólares',
    subtitle: 'Compra para invertir o ahorrar',
    icon: 'DollarSign',
    category: 'action',
    hasDetails: false
  },
  {
    id: 'acciones',
    title: 'Acciones',
    subtitle: 'Invierte desde US $1',
    icon: 'BarChart',
    category: 'action',
    hasDetails: false
  },
] as const;

export const INVESTMENT_RISK_LEVELS = [
  { value: 'muy-conservador', label: 'Muy conservador' },
  { value: 'conservador', label: 'Conservador' },
  { value: 'moderado', label: 'Moderado' },
  { value: 'agresivo', label: 'Agresivo' },
  { value: 'muy-agresivo', label: 'Muy agresivo' },
] as const;

export const INVESTMENT_PERIODS = [
  { value: '3-meses', label: '3 meses' },
  { value: '6-meses', label: '6 meses' },
  { value: '1-año', label: '1 año' },
  { value: '2-años', label: '2 años' },
  { value: '5-años', label: '5 años' },
  { value: 'largo-plazo', label: 'Largo plazo' },
] as const;

export const INVESTMENT_ACCOUNT_TYPES = [
  { value: 'inversion', label: 'Cuenta de inversión' },
  { value: 'ahorro', label: 'Cuenta de ahorro' },
  { value: 'apv', label: 'APV-B' },
] as const;

export const INVESTMENT_TIPS = {
  PORTFOLIO_PERFORMANCE: 'En 28 meses tu inversión ha rentado un 19,55%',
  APV_RESTRICTION: 'No aplica para objetivos APV',
  DOLLAR_RATE: '(a $946 el dólar)',
  CHART_UPDATE: 'Actualizado al cierre del martes 27 de mayo',
} as const;

export const INVESTMENT_MESSAGES = {
  WELCOME_TITLE: 'Un solo lugar para hacer crecer tu patrimonio.',
  WELCOME_SUBTITLE: 'Opciones de ahorro e inversión personalizadas, para todo tipo de inversionista.',
  GUEST_TITLE: 'Invierte en Acciones o ETF',
  GUEST_SUBTITLE: 'La forma más fácil de invertir en la bolsa de Estados Unidos',
  GUEST_FEATURES: [
    '💸 Más de 2000 ETFs y acciones disponibles para comprar',
    '🕒 Al instante: invierte en segundos cuando el mercado está abierto',
    '🧾 Te ayudamos con tu declaración de tus acciones en el SII'
  ],
  GOAL_SELECTION_QUESTION: '¿A qué meta quieres mover tu dinero?',
  GOAL_SELECTION_PLACEHOLDER: 'Selecciona una meta',
  AMOUNT_STEP_TITLE: 'Ingresar monto',
  AMOUNT_CURRENCY_LABEL: 'Pesos chilenos',
} as const;

export const INVESTMENT_SAMPLE_DATA = {
  PATRIMONY_AMOUNT: '$59.809',
  DEPOSITED_AMOUNT: '$50.017',
  VARIATION_AMOUNT: '$9.792',
  INVESTMENT_DETAILS: [
    {
      label: 'Nivel de riesgo',
      value: 'Muy conservador',
    },
    {
      label: 'Plazo de inversión',
      value: '6 meses',
      subtitle: 'Llevas 28 meses',
    },
    {
      label: 'Very Conservative Streep A',
      value: '$59.809',
      subtitle: '100,00%',
    },
  ],
} as const;

export const COPILOT_SUGGESTIONS = {
  WELCOME: [
    {
      text: '¿Cuáles son mis gastos este mes?',
      icon: 'wallet-outline' as const
    },
    {
      text: '¿Cómo va mi presupuesto?',
      icon: 'stats-chart-outline' as const
    },
    {
      text: '¿Cuánto dinero tengo invertido?',
      icon: 'pie-chart-outline' as const
    },
    {
      text: '¿Cuál es el resumen de mi patrimonio?',
      icon: 'person-outline' as const
    }
  ],
  CHAT: [
    {
      text: '¿Cuáles son mis gastos este mes?',
      icon: 'wallet-outline' as const
    },
    {
      text: '¿Cómo va mi presupuesto?',
      icon: 'stats-chart-outline' as const
    },
    {
      text: '¿Cuánto dinero tengo invertido?',
      icon: 'pie-chart-outline' as const
    },
    {
      text: '¿Cuál es el resumen de mi patrimonio?',
      icon: 'person-outline' as const
    }
  ]
};
