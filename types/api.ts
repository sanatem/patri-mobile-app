export interface InvestmentPortfolioItem {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  icon: string;
  category: 'investment' | 'action';
  hasDetails: boolean;
  goal?: string;
  targetAmount?: number;
  currentAmount?: number;
  riskLevel?: string;
  investmentDetails?: {
    depositedAmount: number;
    variationAmount: number;
    variationPercentage: number;
    investmentMonths: number;
    fundName: string;
    fundPercentage: number;
    lastUpdate: string;
  };
}

export interface InvestmentAction {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  category: 'action';
  hasDetails: boolean;
  exchangeRate?: number;
  minAmount?: number;
  currency?: string;
}

export interface InvestmentPortfolio {
  totalPatrimony: string;
  totalDeposited: string;
  totalVariation: string;
  totalVariationPercentage: number;
  investments: InvestmentPortfolioItem[];
  actions: InvestmentAction[];
}

export interface InvestmentSampleData {
  PATRIMONY_AMOUNT: string;
  DEPOSITED_AMOUNT: string;
  VARIATION_AMOUNT: string;
  INVESTMENT_DETAILS: Array<{
    label: string;
    value: string;
    subtitle?: string;
  }>;
}

export interface InvestmentMovement {
  id: string;
  date: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  from: string;
  to: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
}

export interface UserProfile {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  hasPartner: boolean;
  partner?: {
    name: string;
    initials: string;
    email: string;
  };
  personalInfo: {
    age: number;
    occupation: string;
    company: string;
    yearsOfExperience: number;
    education: string;
    maritalStatus: string;
    children: number;
  };
}

export interface InvestmentProfile {
  riskLevel: string;
  riskLevelLabel: string;
  investmentHorizon: string;
  investmentHorizonLabel: string;
  financialKnowledge: string;
  previousInvestments: string[];
  monthlyIncome: string;
  investmentPercentage: string;
  professionRelation: string;
  availablePatrimony: string;
  mainObjective: string;
  surveyAnswers: Record<string, string>;
}

export interface PatrimonyData {
  currentView: 'mine' | 'partner' | 'both';
  assets: {
    mine: Array<{
      id: string;
      name: string;
      type: string;
      value: number;
      change: number;
      color: string;
      accountNumber: string;
      currency: string;
    }>;
    partner: Array<{
      id: string;
      name: string;
      type: string;
      value: number;
      change: number;
      color: string;
      accountNumber: string;
      currency: string;
    }>;
  };
  liabilities: {
    mine: Array<{
      id: string;
      name: string;
      type: string;
      value: number;
      change: number;
      color: string;
      accountNumber: string;
      currency: string;
      monthlyPayment: number;
      remainingMonths: number;
    }>;
    partner: Array<{
      id: string;
      name: string;
      type: string;
      value: number;
      change: number;
      color: string;
      accountNumber: string;
      currency: string;
      monthlyPayment: number;
      remainingMonths: number;
    }>;
  };
  totals: {
    myAssets: number;
    partnerAssets: number;
    totalAssets: number;
    myLiabilities: number;
    partnerLiabilities: number;
    totalLiabilities: number;
    myNetWorth: number;
    partnerNetWorth: number;
    totalNetWorth: number;
  };
}

export interface BudgetItem {
  title: string;
  description: string;
  amount: number;
  category: string;
  frequency: string;
  date: string;
}

export interface ApiGoal {
  id: number;
  name: string;
  kind: string;
  kind_name: string;
  target_amount: number;
  target_date: string;
  unit: string;
  created_at: string;
  wallet_value: number;
  investment_account_id: number;
}

export interface GoalsApiResponse {
  goals: ApiGoal[];
  total_count: number;
}

export interface Goal {
  id: string;
  name: string;
  kind: string;
  kindName: string;
  targetAmount: number;
  targetDate: string;
  unit: string;
  createdAt: string;
  currentAmount: number;
  investmentAccountId: number;
  progress: number;
}

export interface ApiMovement {
  id: number;
  type: string;
  original_amount: number;
  current_amount: number;
  investment_amount: number;
  aasm_state: 'created' | 'confirmed' | 'settled' | 'finished';
  created_at: string;
  updated_at: string;
  source_destination: string;
  payment_method: string;
  broker_portfolio_name: string;
  user_id: number;
  goal_id: number;
  goal_wallet_id: number;
  orphan: boolean;
}

export interface MovementsApiResponse {
  movements: ApiMovement[];
  total_count: number;
}

export interface ApiFixedAsset {
  id: number;
  name: string;
  category: string;
  commercial_value: number;
  unit: string;
  kind: string;
  comments: string;
  created_at: string;
  updated_at: string;
}

export interface ApiSavingInstrument {
  id: number;
  name: string;
  type: string;
  total_amount: number;
  unit: string;
  created_at: string;
  updated_at: string;
}

export interface ApiInvestmentProperty {
  id: number;
  location: string;
  commercial_value: number;
  apartment_number: number;
  square_mts: number;
  number_of_bedrooms: number;
  number_of_bathrooms: number;
  created_at: string;
  updated_at: string;
}

export interface ApiMainHome {
  id: number;
  location: string;
  commercial_value: number;
  apartment_number: number;
  square_mts: number;
  number_of_bedrooms: number;
  number_of_bathrooms: number;
  created_at: string;
  updated_at: string;
  kind: string;
}

export interface ApiAssetsResponse {
  assets: {
    fixed_assets: ApiFixedAsset[];
    saving_instruments: ApiSavingInstrument[];
    investment_properties: ApiInvestmentProperty[];
    main_homes: ApiMainHome[];
  };
  totals: {
    total_assets: number;
    fixed_assets_total: number;
    saving_instruments_total: number;
    investment_properties_total: number;
    main_homes_total: number;
  };
  pagination: {
    current_page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
    has_next_page: boolean;
    has_prev_page: boolean;
  };
}

export interface ApiDebt {
  id: number;
  name: string;
  debt_category: string;
  amount: number;
  installment_amount: number;
  installments_quantity: number;
  unit: string;
  cae_percentage: number;
  comments: string;
  created_at: string;
  updated_at: string;
}

export interface ApiDebtsResponse {
  debts: ApiDebt[];
  totals: {
    total_debts: number;
    total_installments: number;
  };
  pagination: {
    current_page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
    has_next_page: boolean;
    has_prev_page: boolean;
  };
}