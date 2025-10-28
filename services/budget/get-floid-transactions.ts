
import config from '@/config/constants';

export type CategorizationStatus = 'uncategorized' | 'automatic' | 'manual';

export interface FloidTransaction {
  id: number;
  transaction_id: string;
  date: string;
  balance: number;
  transaction_type: 'income' | 'outcome';
  amount: number;
  description: string;
  bank: string;
  account_number: string;
  categorization_status?: CategorizationStatus;
  category?: string;
}

export interface FloidTransactionsResponse {
  transactions: FloidTransaction[];
  pagination: {
    current_page: number;
    total_count: number;
    total_pages: number;
    has_next_page: boolean;
    has_previous_page: boolean;
  };
}

export interface GetFloidTransactionsParams {
  floidId: string;
  page?: number;
  per_page?: number;
  date?: string;
  start_date?: string;
  end_date?: string;
  transaction_type?: 'income' | 'outcome';
  processed?: boolean;
}

export async function getFloidTransactions(
  params: GetFloidTransactionsParams,
  token: string
): Promise<FloidTransactionsResponse | null> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const { floidId, ...queryParams } = params;
    
    const urlParams = new URLSearchParams();
    
    if (queryParams.page) {
      urlParams.append('page', queryParams.page.toString());
    }
    
    if (queryParams.per_page) {
      urlParams.append('per_page', queryParams.per_page.toString());
    }
    
    if (queryParams.date) {
      urlParams.append('date', queryParams.date);
    }
    
    if (queryParams.start_date) {
      urlParams.append('start_date', queryParams.start_date);
    }
    
    if (queryParams.end_date) {
      urlParams.append('end_date', queryParams.end_date);
    }
    
    if (queryParams.transaction_type) {
      urlParams.append('transaction_type', queryParams.transaction_type);
    }
    
    if (queryParams.processed !== undefined) {
      urlParams.append('processed', queryParams.processed.toString());
    }

    const queryString = urlParams.toString();
    const url = `${config.apiBaseUrl}/api/v2/floid/${floidId}/transactions${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token de autenticación inválido o expirado');
      }
      
      if (response.status === 404) {
        return null;
      }
      
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data: FloidTransactionsResponse = await response.json();
    return data;

  } catch (error) {
    console.error('Floid Transactions Service: Error fetching transactions from API:', error);
    throw error;
  }
}

export function calculateTransactionTotals(transactions: FloidTransaction[]) {
  const totals = {
    totalIncome: 0,
    totalOutcome: 0,
    balance: 0,
    transactionCount: transactions.length
  };

  transactions.forEach(transaction => {
    const amount = Number(transaction.amount) || 0;
    
    if (transaction.transaction_type === 'income') {
      totals.totalIncome += amount;
    } else if (transaction.transaction_type === 'outcome') {
      totals.totalOutcome += amount;
    }
  });

  totals.balance = totals.totalIncome - totals.totalOutcome;

  return totals;
}