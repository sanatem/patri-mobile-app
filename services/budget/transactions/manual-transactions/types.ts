export interface ManualTransaction {
  id: number;
  date: string;
  amount_in: number;
  amount_out: number;
  description: string;
  user_category_id: number | null;
  bank_account_id: number;
  created_at: string;
  updated_at: string;
  user_category?: {
    id: number;
    name: string;
    kind: 'income' | 'expense';
    emoji_code: string;
  };
  bank_account?: {
    id: number;
    bank_name: string;
    account_number: string;
    kind: string;
  };
}

export interface CreateManualTransactionParams {
  date: string;
  amount_out?: number;
  amount_in?: number;
  description: string;
  user_category_id?: number | null;
  bank_account_id: number;
}

export interface UpdateManualTransactionParams {
  amount_out?: number;
  amount_in?: number;
  description?: string;
  user_category_id?: number | null;
  date?: string;
}

export interface ManualTransactionResponse {
  success: boolean;
  data: ManualTransaction;
}

export interface ManualTransactionsListResponse {
  success: boolean;
  data: ManualTransaction[];
  meta?: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
}
