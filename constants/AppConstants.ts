import i18next from 'i18next';
export const IMAGES = {
  ADVISOR: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
  EXPERT_1: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  EXPERT_2: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  EXPERT_3: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
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
] as const; //hardcoded, vendra del backend dsp?


export const BUDGET_CATEGORY_KEYS = [
  { key: 'housing', color: '#8e24aa' },
  { key: 'transport', color: '#3b82f6' },
  { key: 'leisure', color: '#ec4899' },
  { key: 'health', color: '#06b6d4' },
  { key: 'services', color: '#10b981' },
] as const;

export const getTranslatedMonths = (): string[] => {
  return i18next.t('months', { returnObjects: true }) as string[];
};


export const TAB_CONFIG = {
  PATRIMONY: [
    { key: 'assets' },
    { key: 'liabilities' }
  ],
  BUDGET: [
    { key: 'income' },
    { key: 'expenses' }
  ]
} as const;

export const REGIONS_AND_COMMUNES = {
  "Región Metropolitana": ["Santiago", "Puente Alto", "Maipú", "La Florida", "Las Condes"],
  "Valparaíso": ["Valparaíso", "Viña del Mar", "Quilpué", "Villa Alemana", "San Antonio"],
  "Biobío": ["Concepción", "Talcahuano", "Los Ángeles", "Coronel", "San Pedro de la Paz"],
  "Araucanía": ["Temuco", "Padre Las Casas", "Villarrica", "Angol", "Pucón"],
  "Los Lagos": ["Puerto Montt", "Osorno", "Castro", "Ancud", "Puerto Varas"],
  "Antofagasta": ["Antofagasta", "Calama", "Mejillones", "Tocopilla"],
} as const;

export const COPILOT_SUGGESTION_KEYS = ['expenses', 'budget', 'investments', 'netWorth'] as const;

export type CopilotSuggestionKey = typeof COPILOT_SUGGESTION_KEYS[number];

export const COPILOT_SUGGESTION_ICONS: Record<CopilotSuggestionKey, 'wallet-outline' | 'stats-chart-outline' | 'pie-chart-outline' | 'person-outline'> = {
  expenses: 'wallet-outline',
  budget: 'stats-chart-outline',
  investments: 'pie-chart-outline',
  netWorth: 'person-outline',
};
